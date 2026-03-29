export interface ParsedOutput {
  worklog: string | null;
  answer: string;
}

const WORKLOG_START = "[[WORKLOG]]";
const WORKLOG_END = "[[/WORKLOG]]";
const ANSWER_START = "[[ANSWER]]";
const ANSWER_END = "[[/ANSWER]]";

/**
 * Parse agent output with hard delimiters.
 *
 * Expected format:
 *   [[WORKLOG]]
 *   reasoning content...
 *   [[/WORKLOG]]
 *   [[ANSWER]]
 *   main content...
 *   [[/ANSWER]]
 *
 * Fallback: if delimiters are missing or malformed, treat entire content as answer.
 */
export function parseAgentOutput(raw: string): ParsedOutput {
  const worklogStartIdx = raw.indexOf(WORKLOG_START);
  const worklogEndIdx = raw.indexOf(WORKLOG_END);
  const answerStartIdx = raw.indexOf(ANSWER_START);
  const answerEndIdx = raw.indexOf(ANSWER_END);

  let worklog: string | null = null;
  let answer: string;

  // Extract worklog if both delimiters present and properly ordered
  if (
    worklogStartIdx !== -1 &&
    worklogEndIdx !== -1 &&
    worklogEndIdx > worklogStartIdx
  ) {
    worklog = raw
      .slice(worklogStartIdx + WORKLOG_START.length, worklogEndIdx)
      .trim();
  }

  // Extract answer if both delimiters present and properly ordered
  if (
    answerStartIdx !== -1 &&
    answerEndIdx !== -1 &&
    answerEndIdx > answerStartIdx
  ) {
    answer = raw
      .slice(answerStartIdx + ANSWER_START.length, answerEndIdx)
      .trim();
  } else {
    // Fallback: everything is the answer
    // But skip worklog section if it was successfully parsed
    if (worklog !== null && worklogEndIdx !== -1) {
      answer = raw.slice(worklogEndIdx + WORKLOG_END.length).trim();
      // Remove any stray [[ANSWER]] or [[/ANSWER]] tags from fallback
      answer = answer
        .replace(ANSWER_START, "")
        .replace(ANSWER_END, "")
        .trim();
    } else {
      answer = raw.trim();
    }
  }

  return { worklog, answer };
}
