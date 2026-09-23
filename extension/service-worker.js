// Background service worker: shows a toolbar badge when a fresh daily phrase is
// waiting, and fires an optional daily reminder notification. Dependency-free
// and defensive so it never throws on partial state.

const LAST_SEEN_DAILY_KEY = "express-myself-last-seen-daily";
const REMINDER_KEY = "express-myself-reminder";
const BADGE_ALARM = "express-myself-daily-badge";
const REMINDER_ALARM = "express-myself-daily-reminder";
const BADGE_COLOR = "#d6613c";

function utcDateKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function readLocal(key) {
  try {
    const items = await chrome.storage.local.get(key);
    return items ? items[key] : undefined;
  } catch {
    return undefined;
  }
}

async function refreshBadge() {
  const seen = await readLocal(LAST_SEEN_DAILY_KEY);
  const isFresh = seen !== utcDateKey();

  try {
    await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
    await chrome.action.setBadgeText({ text: isFresh ? "•" : "" });
  } catch {
    // Ignore; the badge is a nicety, not critical.
  }
}

function parseReminder(raw) {
  if (typeof raw !== "string") {
    return { enabled: false, time: "09:00" };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed && parsed.enabled),
      time: typeof parsed?.time === "string" ? parsed.time : "09:00"
    };
  } catch {
    return { enabled: false, time: "09:00" };
  }
}

async function scheduleReminder() {
  const settings = parseReminder(await readLocal(REMINDER_KEY));
  await chrome.alarms.clear(REMINDER_ALARM);

  if (!settings.enabled) {
    return;
  }

  const [hours, minutes] = settings.time.split(":").map((part) => Number.parseInt(part, 10));
  const next = new Date();
  next.setHours(Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }

  chrome.alarms.create(REMINDER_ALARM, { when: next.getTime(), periodInMinutes: 24 * 60 });
}

function nextUtcMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 5, 0); // just after midnight UTC
  return next.getTime();
}

async function setup() {
  chrome.alarms.create(BADGE_ALARM, { when: nextUtcMidnight(), periodInMinutes: 24 * 60 });
  await refreshBadge();
  await scheduleReminder();
}

chrome.runtime.onInstalled.addListener(() => {
  void setup();
});

chrome.runtime.onStartup.addListener(() => {
  void setup();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === BADGE_ALARM) {
    await refreshBadge();
    return;
  }

  if (alarm.name === REMINDER_ALARM) {
    const seen = await readLocal(LAST_SEEN_DAILY_KEY);
    if (seen !== utcDateKey()) {
      try {
        chrome.notifications.create(`daily-${utcDateKey()}`, {
          type: "basic",
          iconUrl: "assets/icon-128.png",
          title: "ExpressMyself",
          message: "Your daily expression is ready. Keep your streak going!"
        });
      } catch {
        // Notifications may be unavailable; ignore.
      }
    }
    await refreshBadge();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (REMINDER_KEY in changes) {
    void scheduleReminder();
  }

  if (LAST_SEEN_DAILY_KEY in changes) {
    void refreshBadge();
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith("daily-")) {
    void chrome.tabs.create({ url: chrome.runtime.getURL("app.html?view=daily") });
    chrome.notifications.clear(notificationId);
  }
});
