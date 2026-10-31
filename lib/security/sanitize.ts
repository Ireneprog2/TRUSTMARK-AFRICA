export function sanitizeExcerpt(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\b(?:otp|pin|password|verification code|one[- ]time code)\b\s*(?:(?:is|:|=)\s*)?[\w-]+/gi, "[credential removed]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email removed]")
    .replace(/(?:https?:\/\/|www\.)\S+/gi, "[link removed]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, "[number removed]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}