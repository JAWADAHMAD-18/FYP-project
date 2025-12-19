// amadeus.config.js

const AMADEUS_CONFIG = {
  environment: process.env.AMADEUS_ENV || "test",

  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,

  baseUrls: {
    test: "https://test.api.amadeus.com",
    production: "https://api.amadeus.com",
  },
};

export default AMADEUS_CONFIG;
