import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON payload parser with a limit for base64 image data
app.use(express.json({ limit: "10mb" }));

// Initialize the Gemini AI SDK securely on the server
// User-Agent: 'aistudio-build' is required for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to parse base64 image strings (e.g. data:image/jpeg;base64,...)
function parseBase64Image(dataUrl: string) {
  if (!dataUrl) return null;
  
  // If it's a standard web URL, do not treat it as base64 data
  if (dataUrl.startsWith("http://") || dataUrl.startsWith("https://")) {
    return null;
  }

  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  // Fallback if it's already raw base64 or doesn't have the prefix
  if (dataUrl && !dataUrl.includes(",")) {
    return {
      mimeType: "image/jpeg",
      data: dataUrl,
    };
  }
  return null;
}

// Local fallback analyzer for high-demand or missing API keys
function generateLocalFallback(description: string, location: string) {
  const descLower = description.toLowerCase();
  let category = "other";
  let severity = "Medium";
  let summary = "Civic maintenance issue requiring inspection.";

  if (descLower.includes("pothole") || descLower.includes("road") || descLower.includes("crater") || descLower.includes("asphalt")) {
    category = "pothole";
    severity = descLower.includes("dangerous") || descLower.includes("accident") || descLower.includes("severe") ? "High" : "Medium";
    summary = "Hazardous road defect/pothole disrupting vehicular traffic flow.";
  } else if (descLower.includes("light") || descLower.includes("lamp") || descLower.includes("dark") || descLower.includes("bulb")) {
    category = "streetlight";
    severity = descLower.includes("darkness") || descLower.includes("unsafe") ? "High" : "Medium";
    summary = "Non-functional street lighting causing safety concerns during night hours.";
  } else if (descLower.includes("garbage") || descLower.includes("trash") || descLower.includes("waste") || descLower.includes("dump") || descLower.includes("refuse")) {
    category = "garbage";
    severity = descLower.includes("smell") || descLower.includes("park") || descLower.includes("rats") ? "Critical" : "Medium";
    summary = "Accumulated solid waste and refuse creating sanitary hazards.";
  } else if (descLower.includes("water") || descLower.includes("leak") || descLower.includes("pipe") || descLower.includes("flood") || descLower.includes("burst")) {
    category = "water leakage";
    severity = descLower.includes("burst") || descLower.includes("flooding") ? "Critical" : "High";
    summary = "Water infrastructure rupture causing active flooding and resource waste.";
  }

  if (descLower.includes("critical") || descLower.includes("emergency") || descLower.includes("injury")) {
    severity = "Critical";
  }

  const complaintLetter = `To,
The Municipal Commissioner,
City Municipal Corporation,
Department of Public Utilities and Infrastructure

Subject: Official Grievance: Urgent Resolution of ${category.toUpperCase()} Issue at ${location || "Local Neighborhood"}

Dear Sir/Madam,

I am writing to bring to your immediate attention a pressing civic concern regarding a "${category}" located at the following address: ${location || "Local Neighborhood"}.

The detailed description of the reported issue is:
"${description}"

This ongoing issue presents a significant hazard to the residents and commuters in our community. Based on local impact, it represents a ${severity}-level severity problem requiring swift corrective actions. Left unaddressed, it risks causing secondary injuries, property damage, or public health concerns.

Therefore, we request the municipal engineering and field operations teams to prioritize an on-site inspection and carry out the necessary repairs/maintenance to secure this site.

Thank you for your dedicated service to the municipality and for ensuring citizen well-being.

Sincerely,
Concerned Citizen
Submitted via CivicPulse Portal (Local Fallback Mode)`;

  return {
    category,
    severity,
    summary,
    complaintLetter,
    isMocked: true
  };
}

// API endpoint to analyze a civic issue using Gemini AI
app.post("/api/analyze-issue", async (req, res) => {
  const { description, location, image } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required." });
  }

  // 1. If GEMINI_API_KEY is not defined, immediately use our high-quality local fallback rules
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using local fallback rules.");
    return res.json(generateLocalFallback(description, location));
  }

  try {
    // Construct the parts array for multimodal analysis
    const parts: any[] = [];

    if (image) {
      const parsedImage = parseBase64Image(image);
      if (parsedImage) {
        parts.push({
          inlineData: {
            mimeType: parsedImage.mimeType,
            data: parsedImage.data,
          },
        });
      }
    }

    const promptString = `Analyze the following civic issue submitted by a citizen.
Description of the issue: "${description}"
Location provided: "${location || "Unspecified Location"}"

Determine the following:
1. Category of the civic issue (e.g. "pothole", "streetlight", "garbage", "water leakage", "road damage", "traffic sign", "safety hazard", or "other") - keep it to a single lowercase word or two.
2. Severity level of the issue (must be one of: "Low", "Medium", "High", "Critical") based on danger, blockage, or health risks.
3. Generate a professional, formal complaint letter addressed to the Municipal Commissioner / local authority. Use proper municipal letter layouts (To, Subject, structured body paragraphs, formal sign-off). Reference the location and specific details provided. Keep it around 150-250 words.
4. Generate a concise 1-sentence summary of the hazard.

Return the results matching the specified JSON schema.`;

    parts.push({ text: promptString });

    // Call Gemini 3.5 Flash using the @google/genai SDK
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The primary category of the issue (e.g., pothole, streetlight, garbage, water leakage, road damage, traffic sign, safety hazard). Make it lowercase, 1-2 words.",
            },
            severity: {
              type: Type.STRING,
              description: "The assessed severity. Must be one of: Low, Medium, High, Critical.",
            },
            summary: {
              type: Type.STRING,
              description: "A clear, concise 1-sentence summary of the issue.",
            },
            complaintLetter: {
              type: Type.STRING,
              description: "A professional, formal municipal complaint letter with proper greetings, details of location and description, demand for resolution, and signature blocks. Use standard line breaks for formatting.",
            },
          },
          required: ["category", "severity", "summary", "complaintLetter"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini AI model.");
    }

    const parsedResult = JSON.parse(resultText.trim());
    return res.json(parsedResult);

  } catch (error: any) {
    // 2. Fallback to local heuristic analyzer if Gemini API has 503 High Demand or any other transient issue
    console.warn("Gemini AI API call failed or rate-limited. Falling back to local rules gracefully:", error.message || error);
    return res.json(generateLocalFallback(description, location));
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CivicPulse Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
