import axios from "axios";
import { ApiError } from "./apiError.utills.js";
import Ajv from "ajv";

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ajv = new Ajv();
const packageSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    location: { type: "string" },
    title: { type: "string" },
    price: { type: ["number", "null"] },
    currency: { type: "string" },
    highlights: { type: "array", items: { type: "string" } },
    details: { type: "string" },
  },
  required: ["id", "location", "title", "highlights", "details"],
};
const validatePackage = ajv.compile(packageSchema);

const buildPrompt = ({ location, tripType, startDate, endDate, type }) => {
  const start = startDate
    ? new Date(startDate).toISOString().split("T")[0]
    : "N/A";
  const end = endDate ? new Date(endDate).toISOString().split("T")[0] : "N/A";

  if (type === "info") {
    return `You are a knowledgeable travel guide. Provide a concise 3-4 sentence description about "${location}", including history, culture, and why it's interesting to visit. Output plain text or JSON with key "details".`;
  }

  return `You are an expert travel agent. Generate a single travel package as JSON.
Rules:
- Output valid JSON only matching schema: { id, location, title, price, currency, highlights:[], details }
- id: short unique id (pkg-xxxx)
- location: provided destination
- title: short marketing title
- price: integer estimate in PKR
- currency: PKR
- highlights: array of 3-6 short strings
- details: 1-2 sentence description

Input:
location: ${location}
tripType: ${tripType || "general"}
start_date: ${start}
end_date: ${end}

Generate the JSON now.`;
};

// Utility to safely parse JSON returned by Gemini
const safeParseJSON = (text) => {
  if (!text) return null;
  const cleaned = text
    .trim()
    .replace(/^```json\s*/, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// Retry wrapper
const callGeminiAPI = async (prompt, retries = 2) => {
  if (!GEMINI_API_URL || !GEMINI_API_KEY)
    throw new ApiError(500, "Gemini API configuration missing");

  for (let i = 0; i <= retries; i++) {
    try {
      const resp = await axios.post(
        GEMINI_API_URL,
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GEMINI_API_KEY}`,
          },
          timeout: 15000,
        }
      );
      const text = resp.data?.text || resp.data?.result || resp.data;
      return safeParseJSON(
        typeof text === "string" ? text : JSON.stringify(text)
      );
    } catch (err) {
      if (i === retries)
        throw new ApiError(502, `Gemini API failed: ${err.message || err}`);
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i))); // exponential backoff
    }
  }
};

// Main function
export const generatePackageWithGemini = async ({
  location,
  tripType,
  startDate,
  endDate,
  type = "package",
}) => {
  const prompt = buildPrompt({ location, tripType, startDate, endDate, type });
  const parsed = await callGeminiAPI(prompt);

  if (!parsed) throw new ApiError(502, "Gemini returned invalid response");

  if (type === "info") {
    // Return only { details } for location description
    return { details: parsed.details || parsed };
  }

  // Ensure required fields & sanitize
  const sanitized = {
    id: parsed.id || `pkg-${Math.random().toString(36).slice(2, 8)}`,
    location: parsed.location || location,
    title: parsed.title || `${location} Custom Package`,
    price: parsed.price || null,
    currency: "PKR",
    highlights: Array.isArray(parsed.highlights)
      ? parsed.highlights.slice(0, 6)
      : [],
    details: parsed.details || "",
  };

  if (!validatePackage(sanitized))
    throw new ApiError(502, "Gemini generated invalid package JSON");

  return sanitized;
};

export default { generatePackageWithGemini };
