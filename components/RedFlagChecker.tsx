// RedFlagChecker.tsx — fixed duplicate companyLines in parsed AI summary

"use client";

import { useState } from "react";

export default function RedFlagChecker() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [fullReport, setFullReport] = useState<string | null>(null);
  const [companyLines, setCompanyLines] = useState<string[]>([]);
  const [riskParagraph, setRiskParagraph] = useState<string>("");
  const [hasFlags, setHasFlags] = useState(false);

  const handleCheck = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setAiSummary(null);
    setFullReport(null);
    setCompanyLines([]);
    setHasFlags(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/run-redflag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (response.ok && data.report) {
        const parsed = JSON.parse(data.report);
        const raw = parsed?.ai_summary || "No summary available.";
        setAiSummary(raw);
        setFullReport(data.report);
        parseSummarySections(raw);
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

  const stripMarkdown = (text: string) => {
    return text.replace(/[*_`>#\[\]]/g, "").trim();
  };

  const parseSummarySections = (summary: string) => {
    const lines = summary.split("\n").map((line) => line.trim()).filter(Boolean);
    const companies: string[] = [];
    let mode: "company" | "risk" = "company";

    for (const line of lines) {
      if (/key red flags/i.test(line)) continue;
      if (/risk assessment/i.test(line)) {
        mode = "risk";
        continue;
      }

      if (mode === "company" && line.startsWith("•")) {
        const plain = stripMarkdown(line.replace(/^•\s*/, ""));
        const lowered = plain.toLowerCase();
        if (
          lowered.includes("no serious red flags") ||
          lowered.includes("no red flags found") ||
          lowered.includes("no concerns")
        ) {
          continue;
        }

        const [company, statusRaw] = plain.split("–");
        let status = statusRaw?.toLowerCase() || "";

        let phrasing = "may be associated with";
        if (status.includes("possibly") || status.includes("could") || status.includes("unclear")) {
          phrasing = "could be associated with";
        }

        status = status.replace(/possibly|could be|unclear|based on.*$/gi, "").trim();

        companies.push(`• ${company.trim()} ${phrasing} ${status}`);
      }
    }

    // ✅ Deduplicate entries
    const seen = new Set();
    const uniqueCompanies = [];
    for (const c of companies) {
      const key = c.toLowerCase().replace(/\s+/g, " ").trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCompanies.push(c);
      }
    }

    const isClean = uniqueCompanies.length === 0;
    setHasFlags(!isClean);
    setCompanyLines(uniqueCompanies);

    if (isClean) {
      setRiskParagraph(
        `✅ No red flags were detected for ${name} based on public search results. However, we still recommend conducting your own due diligence before entering into any agreements.`
      );
    } else {
      setRiskParagraph(
        `Several companies linked to ${name} may have been involved in liquidation or winding up. This could indicate financial instability or mismanagement. While this does not confirm wrongdoing, it suggests a need for caution. We recommend verifying details independently before entering any agreements.`
      );
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
      <p className="text-sm text-muted-foreground mb-4">
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
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
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
          <div className={`mt-4 p-4 rounded shadow text-xs ${hasFlags ? "bg-gray-100" : "bg-green-50 border border-green-300"}`}>
            <div className={`text-xs font-semibold mb-3 flex items-center gap-1 ${hasFlags ? "text-yellow-700" : "text-green-700"}`}>
              {hasFlags ? "⚠️ Builder Risk Summary" : "✅ No Major Issues Found"}
            </div>

            {hasFlags && companyLines.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-gray-700">
                  Search results suggest the following companies could be associated with potential financial risk:
                </p>
                <ul className="list-disc ml-4 text-gray-800">
                  {companyLines.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <div className="font-semibold text-gray-700 mb-1">📌 Risk Assessment:</div>
              <p className="text-gray-700 leading-relaxed">
                {riskParagraph}
              </p>
              <p className="mt-2 italic text-gray-500">
                This summary is based on search results and public references. These findings may reflect previous or ongoing risks. Please verify with official sources before making decisions.
              </p>
            </div>

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
