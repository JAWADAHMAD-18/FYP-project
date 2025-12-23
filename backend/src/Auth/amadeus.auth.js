import axios from "axios";
import AMADEUS_CONFIG from "../config/amadeus.config.js";

let amadeusAccessToken = null;
let tokenExpiryTime = null;

export const getAmadeusAccessToken = async () => {
  try {
    if (amadeusAccessToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
      return amadeusAccessToken;
    }

    const authUrl = `${
      AMADEUS_CONFIG.baseUrls[AMADEUS_CONFIG.environment]
    }/v1/security/oauth2/token`;

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_CONFIG.clientId,
      client_secret: AMADEUS_CONFIG.clientSecret,
    }).toString();

    const response = await axios.post(authUrl, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 100000,
    });

    // 5️⃣ Save token & expiry
    amadeusAccessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000;

    return amadeusAccessToken;
  } catch (error) {
    console.error(" Amadeus Authentication Failed");

    if (error.response) {
      // Amadeus API error
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else if (error.request) {
      // No response from server
      console.error("No response received from Amadeus");
    } else {
      console.error("Error:", error.message);
    }

    throw new Error("Unable to obtain Amadeus access token");
  }
};
