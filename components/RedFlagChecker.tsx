"use client";
import { useState } from "react";

export default function RedFlagChecker() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);
  const [fullReport, setFullReport] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setParsedSummary(null);
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
        setParsedSummary(parsed?.parsed_summary || "No summary available.");
        setFullReport(data.report);
      } else {
        setParsedSummary("An error occurred while analyzing the builder.");
      }
    } catch (error) {
      console.error("Error:", error);
      setParsedSummary("Unexpected error occurred. Please try again.");
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

        {parsedSummary && (
          <div className="mt-4 bg-white border rounded-lg shadow-md p-4">
            <div className="flex items-center mb-2">
              <span
                className={`text-xl ${
                  parsedSummary.toLowerCase().includes("no red flags")
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {parsedSummary.toLowerCase().includes("no red flags") ? "✅" : "⚠️"}
              </span>
              <h2 className="ml-2 font-semibold text-gray-800">AI Summary</h2>
            </div>

            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
              {parsedSummary
                .split("•")
                .filter((point) => point.trim() !== "")
                .map((point, idx) => (
                  <li key={idx}>{point.trim()}</li>
                ))}
            </ul>

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
