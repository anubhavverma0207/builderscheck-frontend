"use client";

import { useState, useEffect } from "react";
import { markdownToHtml } from "@/lib/markdown";

export default function RedFlagChecker() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [htmlSummary, setHtmlSummary] = useState<string>("");
  const [fullReport, setFullReport] = useState<string | null>(null);

  useEffect(() => {
    async function convert() {
      if (aiSummary) {
        const html = await markdownToHtml(aiSummary);
        setHtmlSummary(html);
      }
    }
    convert();
  }, [aiSummary]);

  const handleCheck = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setAiSummary(null);
    setFullReport(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/run-redflag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();

      if (response.ok && data.report) {
        const parsed = JSON.parse(data.report);
        setAiSummary(parsed?.ai_summary || "No summary available.");
        setFullReport(data.report);
      } else {
        setAiSummary("An error occurred while analyzing the builder.");
      }
    } catch (error) {
      console.error("Error:", error);
      setAiSummary("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!fullReport) return;
    const blob = new Blob([fullReport], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "_")}_report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <p className="text-base text-muted-foreground mb-4">
        🔍 Trusted builder background checks for Kiwi homeowners
      </p>

      <div className="w-full max-w-md shadow-xl p-6 flex flex-col gap-4 bg-white rounded-lg border">
        <h1 className="text-xl font-semibold text-center flex items-center justify-center gap-2">
          <span role="img" aria-label="Search">🔎</span> BuildersCheck
        </h1>

        <p className="text-sm text-center text-gray-500">
          Enter builder or company name to check for risk flags
        </p>

        <input
          type="text"
          className="w-full border px-4 py-2 rounded text-sm"
          placeholder="e.g. Wade Eatts or Oceane Holdings"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={handleCheck}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Checking..." : "Run Background Check"}
        </button>

        {loading && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-400 border-t-transparent" />
          </div>
        )}

        {aiSummary && (
          <div className="mt-4 bg-gray-100 p-4 rounded shadow">
            <div className="text-sm font-semibold mb-2 text-yellow-700 flex items-center gap-1">
              <span role="img" aria-label="warning">⚠️</span> AI Summary (for your awareness):
            </div>

            <div
              className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-800"
              dangerouslySetInnerHTML={{ __html: htmlSummary }}
            />

            {fullReport && (
              <button
                onClick={handleDownload}
                className="mt-4 text-white bg-gray-700 hover:bg-gray-900 px-4 py-2 rounded"
              >
                Download Full Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
