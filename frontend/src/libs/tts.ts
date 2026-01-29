export function speak(text: string, lang = "ja-JP") {
  if (!window.speechSynthesis) {
    console.warn("Web Speech API not supported");
    return;
  }

  // Cancel current speech to avoid queuing
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;

  // Try to find a specific voice for the language
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}
