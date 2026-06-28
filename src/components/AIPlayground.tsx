import { useState } from "react";
import { BrainCircuit, Sparkles, FileText, BadgeAlert, Copy, Check, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SeverityLevel } from "../types";

// Scenario presets to let users click and test immediately
const SCENARIOS = [
  {
    title: "Dim Streetlights",
    text: "At least four streetlights are broken on Oakwood road. It gets extremely dark after 7 PM, making it unsafe for women and children returning home. There have been minor tripping incidents on the broken curb already.",
    location: "Oakwood Road near Sector 5 Community Center",
  },
  {
    title: "Burst Water Line",
    text: "A huge water pipe burst near the grocery store corner, flooding the street with thousands of gallons of clean drinking water. The water is washing away road soil, and creating a massive muddy swamp that is blocking parkings.",
    location: "Main Market Street, outside Corner Mart Store",
  },
  {
    title: "Sewer Overflow",
    text: "Sewage water is bubbling up from the manhole near the bus shelter. The odor is absolutely unbearable, and sewage is pooling across the bus boarding platform. Pedestrians can't stand at the shelter and are forced onto the highway.",
    location: "Bus Stop #14, National Highway East Side",
  }
];

export default function AIPlayground() {
  const [inputText, setInputText] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    category: string;
    severity: SeverityLevel;
    summary: string;
    complaintLetter: string;
    isMocked?: boolean;
  } | null>(null);

  const handleRunPreset = (presetText: string, presetLoc: string) => {
    setInputText(presetText);
    setInputLocation(presetLoc);
    handleAnalyze(presetText, presetLoc);
  };

  const handleAnalyze = async (textToUse?: string, locToUse?: string) => {
    const desc = textToUse || inputText;
    const loc = locToUse || inputLocation;

    if (!desc.trim()) {
      setError("Please write some description text or choose a preset.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          location: loc || "Municipal Area",
          image: null, // No image in this text playground
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from CivicPulse server.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.complaintLetter) return;
    navigator.clipboard.writeText(result.complaintLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.complaintLetter) return;
    const element = document.createElement("a");
    const file = new Blob([result.complaintLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `CivicPulse_Complaint_${result.category.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getSeverityColor = (level: SeverityLevel) => {
    switch (level) {
      case "Low":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "High":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Critical":
        return "bg-red-50 text-red-700 border-red-200 animate-pulse";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div id="ai-playground-module" className="max-w-4xl mx-auto space-y-6">
      {/* Briefing Intro */}
      <div className="bg-orange-500 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 shrink-0" />
            <h2 className="text-xl font-bold">Gemini AI Classification Engine</h2>
          </div>
          <p className="text-sm text-orange-50 leading-relaxed">
            Module 2 handles cognitive analysis. It extracts categories, assesses risks, summarizes details, and auto-generates municipal complaint letters.
          </p>
        </div>
        <span className="bg-white/20 text-white border border-white/30 text-xs px-3 py-1 rounded-full font-semibold shrink-0">
          Powered by Gemini 3.5 Flash
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Input Panel */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-orange-100 p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Interactive Playground
          </h3>
          <p className="text-xs text-gray-500">
            Write any issue below to see how Gemini structures the complaint, maps category, and sets severity.
          </p>

          {/* Preset Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Presets</span>
            <div className="flex flex-col gap-1.5">
              {SCENARIOS.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunPreset(sc.text, sc.location)}
                  className="text-left text-xs bg-orange-50/40 hover:bg-orange-50 text-orange-950 font-medium p-2.5 rounded-lg border border-orange-100/50 hover:border-orange-200 transition-all focus:outline-none"
                >
                  {sc.title} preset
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-orange-50 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Description</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                className="w-full text-xs rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Type your own issue here..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location / Landmarks</label>
              <input
                type="text"
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                className="w-full text-xs rounded-lg border border-gray-200 p-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g. 5th Block Road corner"
              />
            </div>
            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !inputText.trim()}
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 text-white text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center space-x-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Classifying...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Submit to Gemini AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-orange-100 p-5 shadow-sm min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 animate-pulse mb-4 border border-orange-100">
                  <BrainCircuit className="w-8 h-8 animate-spin" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Processing Natural Language</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Gemini is parsing your inputs, identifying keywords, judging public hazards, and framing a professional legal complaint...
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs space-y-2"
              >
                <div className="font-bold flex items-center gap-1">
                  <BadgeAlert className="w-4 h-4 shrink-0" />
                  AI Analysis Encountered an Error
                </div>
                <p>{error}</p>
                <p className="text-[10px] text-red-500">Verify your local dev environment has access to the server port and API key.</p>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 h-full"
              >
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 border-b border-orange-50 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Categorization</span>
                    <span className="text-sm font-bold text-gray-900 capitalize flex items-center gap-1.5 mt-0.5">
                      <span className="w-2.5 h-2.5 bg-orange-500 rounded-full"></span>
                      {result.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Assessed Severity</span>
                    <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mt-0.5 ${getSeverityColor(result.severity)}`}>
                      {result.severity}
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-orange-50/30 border border-orange-100/50 rounded-xl p-3">
                  <span className="text-[10px] font-semibold text-orange-800 uppercase tracking-wider block">AI Summary</span>
                  <p className="text-xs text-orange-950 font-medium mt-1 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Complaint letter preview */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      Auto-Drafted complaint letter
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-all focus:outline-none"
                        title="Download Text File"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="border border-orange-50 rounded-xl bg-orange-50/5 p-3.5 h-56 overflow-y-auto font-mono text-[11px] leading-relaxed text-gray-700 whitespace-pre-wrap">
                    {result.complaintLetter}
                  </div>
                </div>

                {result.isMocked && (
                  <p className="text-[10px] text-orange-600 font-medium text-center italic bg-orange-50 p-1.5 rounded-lg border border-orange-200/50">
                    Running in local fallback mode (Gemini simulated response). Set GEMINI_API_KEY for live generation.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-400"
              >
                <BrainCircuit className="w-12 h-12 text-orange-200 mb-2" />
                <h4 className="text-xs font-semibold text-gray-800">No output generated yet</h4>
                <p className="text-[11px] text-gray-500 max-w-[240px] mt-1 mx-auto leading-normal">
                  Choose a scenario on the left or type your own complaint, then click the AI classification button.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
