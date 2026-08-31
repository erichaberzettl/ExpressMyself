import { LanguageCode } from "./types";

type VoiceConfig = {
  lang: string;
  families: string[];
  preferredVoiceNames: string[];
};

// Shared speech configuration and playback used by both the web app
// (ExpressionCard) and the Chrome extension popup, so voice selection and
// pronunciation tuning stay identical across surfaces.
export const voiceConfigByLanguage: Record<LanguageCode, VoiceConfig> = {
  en: {
    lang: "en-US",
    families: ["en"],
    preferredVoiceNames: [
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
    ]
  },
  es: {
    lang: "es-ES",
    families: ["es"],
    preferredVoiceNames: ["Monica", "Paulina", "Jorge", "Google español", "Google español de España"]
  },
  fr: {
    lang: "fr-FR",
    families: ["fr"],
    preferredVoiceNames: ["Thomas", "Amelie", "Google français"]
  },
  de: {
    lang: "de-DE",
    families: ["de"],
    preferredVoiceNames: ["Anna", "Petra", "Vicki", "Google Deutsch", "Google Deutsch (Deutschland)"]
  },
  pt: {
    lang: "pt-PT",
    families: ["pt"],
    preferredVoiceNames: ["Joana", "Luciana", "Google português"]
  },
  it: {
    lang: "it-IT",
    families: ["it"],
    preferredVoiceNames: ["Alice", "Luca", "Google italiano"]
  },
  nl: {
    lang: "nl-NL",
    families: ["nl"],
    preferredVoiceNames: ["Xander", "Claire", "Google Nederlands"]
  },
  sv: {
    lang: "sv-SE",
    families: ["sv"],
    preferredVoiceNames: ["Alva", "Oskar", "Google svenska"]
  },
  da: {
    lang: "da-DK",
    families: ["da"],
    preferredVoiceNames: ["Sara", "Magnus", "Google dansk"]
  },
  pl: {
    lang: "pl-PL",
    families: ["pl"],
    preferredVoiceNames: ["Zosia", "Krzysztof", "Google polski"]
  }
};

export function selectVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  language: LanguageCode
): SpeechSynthesisVoice | null {
  const config = voiceConfigByLanguage[language];
  const matchingVoices = voices.filter((voice) => {
    const voiceLang = voice.lang.toLowerCase();
    return config.families.some((family) => voiceLang.startsWith(family.toLowerCase()));
  });

  if (matchingVoices.length === 0) {
    return null;
  }

  const preferredVoice = config.preferredVoiceNames
    .map((name) => matchingVoices.find((voice) => voice.name === name))
    .find(Boolean);

  if (preferredVoice) {
    return preferredVoice;
  }

  if (language === "en") {
    return null;
  }

  return (
    matchingVoices.find((voice) => voice.default) ??
    matchingVoices.find((voice) => voice.localService) ??
    matchingVoices[0]
  );
}

export function speakExpression(text: string, language: LanguageCode): void {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const config = voiceConfigByLanguage[language];
  const synth = window.speechSynthesis;

  const speakWithVoice = (selectedVoice?: SpeechSynthesisVoice | null) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    utterance.rate = language === "en" ? 1 : 0.84;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    synth.cancel();
    synth.resume?.();
    synth.speak(utterance);
  };

  const voices = synth.getVoices();
  const selectedVoice = selectVoiceForLanguage(voices, language);

  // Speak immediately from the click event so embedded browsers do not treat it
  // as an async autoplay attempt if voices load late.
  speakWithVoice(selectedVoice);

  if (voices.length > 0 || selectedVoice) {
    return;
  }

  // Trigger voice enumeration so later clicks can pick a better voice.
  synth.getVoices();
}
