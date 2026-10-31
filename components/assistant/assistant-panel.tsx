"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, Copy, Languages, LoaderCircle, MessageCircle, Send, Sparkles } from "lucide-react";

type Language = "en" | "rw" | "fr";
type Mode = "help" | "translate";
type ConversationItem = { question: string; answer: string; source: "ai" | "local" };

const languageOptions: Array<[Language, string]> = [
  ["en", "English"],
  ["rw", "Kinyarwanda"],
  ["fr", "French"],
];

export function AssistantPanel() {
  const [mode, setMode] = useState<Mode>("help");
  const [aiConfigured, setAIConfigured] = useState<boolean | null>(null);
  const [assistantStatusError, setAssistantStatusError] = useState("");
  const [consent, setConsent] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [sourceLanguage, setSourceLanguage] = useState<"auto" | Language>("auto");
  const [targetLanguage, setTargetLanguage] = useState<Language>("rw");
  const [translationText, setTranslationText] = useState("");
  const [translationResult, setTranslationResult] = useState("");
  const [translationCopied, setTranslationCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/assistant")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load assistant status.");
        return response.json() as Promise<{ aiConfigured: boolean }>;
      })
      .then((data) => {
        if (typeof data.aiConfigured !== "boolean") throw new Error("Assistant status is invalid.");
        setAIConfigured(data.aiConfigured);
      })
      .catch(() => {
        setAIConfigured(false);
        setAssistantStatusError("Could not check translation availability. Refresh the page and try again.");
      });
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setTranslationResult("");
    setTranslationCopied(false);
    const text = mode === "help" ? question : translationText;
    const payload = mode === "help"
      ? { task: "help", text, language, consentToExternalProcessing: consent }
      : { task: "translate", text, sourceLanguage, targetLanguage, consentToExternalProcessing: consent };

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Assistant is temporarily unavailable.");

      if (mode === "help") {
        setConversation((items) => [...items, { question, answer: data.response, source: data.source }]);
        setQuestion("");
      } else {
        setTranslationResult(data.response);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Assistant is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  function changeSourceLanguage(value: "auto" | Language) {
    setSourceLanguage(value);
    if (value !== "auto" && value === targetLanguage) {
      setTargetLanguage(languageOptions.find(([language]) => language !== value)?.[0] ?? "en");
    }
    setTranslationResult("");
    setTranslationCopied(false);
    setError("");
  }

  function changeTargetLanguage(value: Language) {
    setTargetLanguage(value);
    setTranslationResult("");
    setTranslationCopied(false);
    setError("");
  }

  async function copyTranslation() {
    try {
      await navigator.clipboard.writeText(translationResult);
      setTranslationCopied(true);
      setError("");
    } catch {
      setError("Could not copy the translation. Select and copy the text instead.");
    }
  }

  return <section className="assistant-workspace">
    <div aria-label="Assistant tools" className="assistant-tabs" role="tablist">
      <button aria-selected={mode === "help"} className="assistant-tab" onClick={() => { setMode("help"); setError(""); }} role="tab" type="button"><MessageCircle size={16} />Ask for help</button>
      <button aria-selected={mode === "translate"} className="assistant-tab" onClick={() => { setMode("translate"); setError(""); }} role="tab" type="button"><Languages size={16} />Translate</button>
    </div>

    <div className="assistant-panel">
      {mode === "help" ? <>
        <div className="assistant-intro"><span className="assistant-icon"><Sparkles size={17} /></span><div><h2>How can I help?</h2><p>Ask about message checks, reports, alerts, or staying safer online.</p></div></div>
        <div aria-live="polite" className="assistant-conversation">
          {conversation.length === 0 && <p className="assistant-empty">Try asking “Should I share an OTP?” or “How do I report a suspicious message?”</p>}
          {conversation.map((item, index) => <article className="assistant-exchange" key={`${index}-${item.question}`}>
            <p className="assistant-question">{item.question}</p>
            <div className="assistant-answer"><p>{item.answer}</p><small>{item.source === "ai" ? "AI-assisted · verify important information" : "Local safety guidance"}</small></div>
          </article>)}
        </div>
        <form className="assistant-form" onSubmit={submit}>
          <label className="field-label" htmlFor="assistant-question">Your question</label>
          <textarea className="message-input assistant-input" id="assistant-question" maxLength={4000} onChange={(event) => setQuestion(event.target.value)} placeholder="Describe the TrustMark challenge you need help with..." required value={question} />
          <div className="assistant-controls"><label className="assistant-language"><span>Reply in</span><select className="form-control" onChange={(event) => setLanguage(event.target.value as Language)} value={language}>{languageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><span className="char-count">{question.length}/4,000</span><button className="button" disabled={loading || !question.trim() || aiConfigured === null || (aiConfigured && !consent)} type="submit">{loading ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}{loading ? "Thinking" : "Ask assistant"}</button></div>
        </form>
      </> : <>
        <div className="assistant-intro"><span className="assistant-icon"><Languages size={17} /></span><div><h2>Translate a message</h2><p>Translate between Kinyarwanda, English, and French.</p></div></div>
        <form className="assistant-form translator-form" onSubmit={submit}>
          <div className="translation-language-row">
            <label className="assistant-language"><span>From</span><select className="form-control" onChange={(event) => changeSourceLanguage(event.target.value as "auto" | Language)} value={sourceLanguage}><option value="auto">Detect language</option>{languageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button aria-label="Swap source and target languages" className="translation-swap" disabled={sourceLanguage === "auto"} onClick={() => {
              const nextSource = targetLanguage;
              setTargetLanguage(sourceLanguage as Language);
              setSourceLanguage(nextSource);
              setTranslationResult("");
              setTranslationCopied(false);
              setError("");
            }} type="button"><ArrowLeftRight size={16} /></button>
            <label className="assistant-language"><span>To</span><select className="form-control" onChange={(event) => changeTargetLanguage(event.target.value as Language)} value={targetLanguage}>{languageOptions.map(([value, label]) => <option disabled={value === sourceLanguage} key={value} value={value}>{label}</option>)}</select></label>
          </div>
          <label className="field-label" htmlFor="translation-text">Text to translate</label>
          <textarea className="message-input translation-input" id="translation-text" maxLength={4000} onChange={(event) => { setTranslationText(event.target.value); setTranslationResult(""); setTranslationCopied(false); setError(""); }} placeholder="Enter text in Kinyarwanda, English, or French..." required value={translationText} />
          <div className="assistant-controls"><span className="char-count">{translationText.length}/4,000</span><button className="button" disabled={loading || !translationText.trim() || !aiConfigured || (sourceLanguage !== "auto" && sourceLanguage === targetLanguage) || (aiConfigured && !consent)} type="submit">{loading ? <LoaderCircle className="spin" size={16} /> : <Languages size={16} />}{loading ? "Translating" : "Translate"}</button></div>
        </form>
        {translationResult && <section aria-label="Translation result" aria-live="polite" className="translation-result"><div className="translation-result-heading"><div className="translation-result-label">{languageOptions.find(([value]) => value === targetLanguage)?.[1]} translation</div><button aria-label={translationCopied ? "Translation copied" : "Copy translation"} className="translation-copy" onClick={copyTranslation} type="button">{translationCopied ? <Check size={14} /> : <Copy size={14} />}{translationCopied ? "Copied" : "Copy"}</button></div><p>{translationResult}</p></section>}
        {assistantStatusError ? <p className="assistant-config-note" role="alert">{assistantStatusError}</p> : aiConfigured === false && <p className="assistant-config-note">Translation needs a server-side AI provider. Set AI_API_KEY and AI_MODEL in .env.local, then restart the app. No translation will be guessed or fabricated.</p>}
      </>}

      {aiConfigured && <label className="assistant-consent"><input checked={consent} onChange={(event) => setConsent(event.target.checked)} type="checkbox" /><span>I agree that this text may be sent to TrustMark Africa&apos;s configured AI provider to answer or translate it. I will not include passwords, PINs, OTPs, or financial details.</span></label>}
      {aiConfigured === false && mode === "help" && <p className="assistant-local-note">Common safety questions are answered locally. Open-ended AI replies and translation require server configuration.</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="assistant-disclaimer">The assistant can make mistakes. Don&apos;t rely on it as a fraud verdict, and verify important guidance independently. Text is not saved by this feature.</p>
    </div>
  </section>;
}