import { LanguageCode } from "../../lib/types";
import { languagesByCode } from "../../lib/languages";

let voicesReadyPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const preferredEnglishVoiceNames = [
  "Alex",
  "Google US English",
  "Google UK English Male",
  "Google UK English Female",
  "Daniel",
  "Microsoft Mark - English (United States)",
  "Microsoft David - English (United States)",
  "Microsoft Zira - English (United States)",
  "Ava",
  "Samantha"
];

function getLanguageVoiceCandidates(language: LanguageCode): string[] {
  const exact = languagesByCode[language].speechLang.toLowerCase();
  const base = language.toLowerCase();

  return [exact, base];
}

function resolveMatchingVoice(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const candidates = getLanguageVoiceCandidates(language);

  if (language === "en") {
    return (
      preferredEnglishVoiceNames
        .map((name) => voices.find((voice) => voice.name === name))
        .find(Boolean) ?? null
    );
  }

  for (const candidate of candidates) {
    const exactMatch = voices.find((voice) => voice.lang.toLowerCase() === candidate);
    if (exactMatch) {
      return exactMatch;
    }
  }

  for (const candidate of candidates) {
    const prefixMatch = voices.find((voice) => voice.lang.toLowerCase().startsWith(candidate));
    if (prefixMatch) {
      return prefixMatch;
    }
  }

  return null;
}

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const immediateVoices = synth.getVoices();

  if (immediateVoices.length > 0) {
    return Promise.resolve(immediateVoices);
  }

  if (voicesReadyPromise) {
    return voicesReadyPromise;
  }

  const pendingVoices = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const handleVoicesChanged = () => {
      const loadedVoices = synth.getVoices();
      if (loadedVoices.length === 0) {
        return;
      }

      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      resolve(loadedVoices);
    };

    synth.addEventListener("voiceschanged", handleVoicesChanged);

    window.setTimeout(() => {
      synth.removeEventListener("voiceschanged", handleVoicesChanged);
      resolve(synth.getVoices());
    }, 600);
  }).finally(() => {
    voicesReadyPromise = null;
  });

  voicesReadyPromise = pendingVoices;
  return pendingVoices;
}

export async function speakExpression(expression: string, language: LanguageCode) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(expression);
  utterance.lang = languagesByCode[language].speechLang;
  utterance.rate = language === "en" ? 1 : 0.86;
  utterance.pitch = 1;

  const synth = window.speechSynthesis;
  const matchingVoice = resolveMatchingVoice(await getVoices(), language);

  if (matchingVoice) {
    utterance.voice = matchingVoice;
    utterance.lang = matchingVoice.lang;
  }

  synth.cancel();
  synth.speak(utterance);
}
