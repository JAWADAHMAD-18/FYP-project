import "dotenv/config";
import { createCustomPackage } from "./controllers/customPackage.controllers.js";

// ----------------------
// Fake req / res objects
// ----------------------
const mockReq = {
  body: {
    tripType: "international",
    locations: ["Paris", "London"],
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    adults: 1,
  },
};

const mockRes = {
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    console.log("\n✅ RESPONSE STATUS:", this.statusCode);
    console.log("📦 Message:", payload.message);

    const data = payload.message;

    // -------- Weather ----------
    console.log("\n🌤️ WEATHER CHECK:");
    data.locations.forEach((loc, i) => {
      if (loc.weather) {
        console.log(`${i + 1}. ${loc.name} → ${loc.weather.length} days`);
      } else {
        console.log(`${i + 1}. ${loc.name} → Weather Error`);
      }
    });

    // -------- Hotels ----------
    console.log("\n🏨 HOTELS CHECK:");
    data.locations.forEach((loc, i) => {
      if (loc.hotels?.length) {
        console.log(`${i + 1}. ${loc.name} → ${loc.totalHotels} hotels`);

        loc.hotels.slice(0, 5).forEach((h, idx) => {
          console.log(
            `   ${idx + 1}. ${h.name} | Rating: ${h.rating || "N/A"}`
          );
          // ek hotel detail
          console.log("\n🏨 SINGLE HOTEL FULL OBJECT:");
          console.dir(data.destination.hotels[0], { depth: null });
        });
      } else {
        console.log(`${i + 1}. ${loc.name} → No hotels / error`);
      }
    });

    // -------- Flights ----------
    console.log("\n✈️ FLIGHTS CHECK:");
    if (data.flights?.offers?.length) {
      console.log(`Total Offers: ${data.flights.count}`);

      data.flights.offers.slice(0, 5).forEach((f, i) => {
        console.log(
          `${i + 1}. ${f.airline} | ${f.departure.time} → ${f.arrival.time} | ${
            f.price.total
          } ${f.price.currency}`
        );
        // ek flight detail
        console.log("\n✈️ SINGLE FLIGHT FULL OBJECT:");
        console.dir(data.flights.offers[0], { depth: null });
      });
    } else {
      console.log("No flights or error");
    }

    console.log("\n🏁 CUSTOM PACKAGE TEST COMPLETED");
  },
};

// ----------------------
// Run test
// ----------------------
const runTest = async () => {
  console.log("\n🚀 RUNNING CUSTOM PACKAGE CONTROLLER TEST");

  try {
    await createCustomPackage(mockReq, mockRes);
  } catch (err) {
    console.error("\n❌ TEST FAILED");
    console.error(err.message);
  }
};

runTest();
