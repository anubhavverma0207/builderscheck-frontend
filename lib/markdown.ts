import { marked } from "marked";

export async function markdownToHtml(md: string): Promise<string> {
  return await marked(md || "");
}
