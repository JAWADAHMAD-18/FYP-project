import asyncHandler from "../utills/asynchandler.utills.js";
import { detectIntentAdvanced } from "../utills/nlp.utills.js";
import Package from "../models/packages.models.js";
import { generatePackageWithGemini } from "../utills/gemini.utills.js";
import Ajv from "ajv";
import axios from "axios";

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

const geocodeLocation = async (location) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: location, format: "json", limit: 1 },
    });
    return res.data.length ? res.data[0].display_name : null;
  } catch {
    return null;
  }
};

const sanitizePackage = (pkg, fallbackLocation) => ({
  id: pkg.id || `pkg-${Math.random().toString(36).slice(2, 8)}`,
  location: pkg.location || fallbackLocation,
  title: pkg.title || `${fallbackLocation} Custom Package`,
  price: pkg.price || null,
  currency: pkg.currency || "USD",
  highlights: Array.isArray(pkg.highlights) ? pkg.highlights.slice(0, 6) : [],
  details: pkg.details || "",
});

const buildGeneralPrompt = (tripType) =>
  `You are a travel expert. User requested ${
    tripType || "travel"
  } suggestions. Provide 5 destinations with one-line reason. Output valid JSON.`;

export const chatHandler = asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string")
    return res.status(400).json({ reply: "Message is required" });

  const { intent, location, tripType } = detectIntentAdvanced(message);

  if (intent === "non-travel") {
    return res.json({
      reply:
        "I only answer travel-related questions. Please ask about destinations, packages, hotels or flights.",
    });
  }

  // Package request
  if (intent === "package") {
    if (!location) {
      return res.json({
        reply:
          "Which destination are you interested in? Please provide the city or country name.",
      });
    }

    const validLocation = await geocodeLocation(location);
    if (!validLocation)
      return res.json({
        reply: `I couldn't verify the location "${location}". Could you check the spelling?`,
      });

    const existing = await Package.findOne({
      location: { $regex: `^${validLocation}$`, $options: "i" },
    }).lean();
    if (existing)
      return res.json({
        reply: `I found a package for ${existing.location}.`,
        package: sanitizePackage(existing, validLocation),
      });

    let generated;
    try {
      generated = await generatePackageWithGemini({
        location: validLocation,
        tripType,
      });
    } catch {
      return res.json({
        reply: `I couldn't generate a package for ${validLocation} right now. Try again later.`,
      });
    }

    const sanitized = sanitizePackage(generated, validLocation);
    if (!validatePackage(sanitized))
      return res.json({
        reply: `Generated package for ${validLocation} is invalid. Please try a different request.`,
      });

    return res.json({
      reply: `No ready package for ${validLocation}, but here's a custom plan.`,
      package: sanitized,
    });
  }

  // General location query (user asks about a place, not a package)
  if (intent === "general" && location) {
    let info;
    try {
      info = await generatePackageWithGemini({ location, type: "info" });
    } catch {
      info = { details: `I don't have info for ${location} right now.` };
    }
    return res.json({
      reply: info.details || `Here is some information about ${location}.`,
    });
  }

  // General travel suggestions
  if (intent === "general") {
    let generated;
    try {
      generated = await generatePackageWithGemini({
        location: tripType || "general",
        tripType,
      });
      const suggestions = Array.isArray(generated.highlights)
        ? generated.highlights
        : [generated.title || generated.location];
      return res.json({
        reply: "Here are some travel suggestions:",
        suggestions,
      });
    } catch {
      return res.json({
        reply: "Here are some popular travel destinations:",
        suggestions: ["Bali", "Maldives", "Santorini"],
      });
    }
  }

  // Ambiguous
  return res.json({
    reply:
      "Could you clarify if you want a package for a location or general travel suggestions?",
  });
});
