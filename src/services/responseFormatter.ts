/**
 * Utility to format and sanitize streaming markdown to prevent broken tags or unclosed blocks.
 */
export function sanitizeStreamingMarkdown(text: string): string {
  if (!text) return "";

  let sanitized = text;

  // Count backticks to detect unclosed code blocks
  const codeBlockCount = (sanitized.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    // If we have an odd number of triple backticks, append a closing code block
    // We append with a newline if it doesn't end with one
    if (!sanitized.endsWith("\n")) {
      sanitized += "\n";
    }
    sanitized += "```";
  }

  // Count single backticks for inline code
  const inlineBacktickCount = (sanitized.replace(/```/g, "").match(/`/g) || []).length;
  if (inlineBacktickCount % 2 !== 0) {
    sanitized += "`";
  }

  // Count asterisks for bold/italic formatting
  const asteriskCount = (sanitized.match(/\*/g) || []).length;
  if (asteriskCount % 2 !== 0) {
    sanitized += "*";
  }

  return sanitized;
}
