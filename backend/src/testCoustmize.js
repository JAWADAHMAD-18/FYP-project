import "dotenv/config";
import { searchHotelsWithAvailability } from "./utills/hotels.utills.js";
import { searchFlights } from "./utills/flights.utills.js";

const getFutureDate = (daysFromNow) =>
  new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

const testHotels = async () => {
  console.log("\n🏨 Testing Hotels API...");
  try {
    const checkInDate = getFutureDate(3);
    const checkOutDate = getFutureDate(7);

    const hotels = await searchHotelsWithAvailability({
      cityName: "Paris",
      checkInDate,
      checkOutDate,
      adults: 2,
    });

    console.log(`✅ Hotels OK: ${hotels.totalHotels} hotels found`);

    // Show only first 5 hotels
    console.log("\nFirst 5 Hotels:");
    hotels.hotels.slice(0, 5).forEach((h, i) => {
      console.log(`${i + 1}. ${h.name} - Rating: ${h.rating || "N/A"}`);
    });
  } catch (err) {
    console.error("❌ Hotels FAILED");
    console.error(err.response?.data || err.message);
  }
};

const testFlights = async () => {
  console.log("\n✈️ Testing Flights API...");
  try {
    const departureDate = getFutureDate(3);
    const returnDate = getFutureDate(7);

    const flights = await searchFlights({
      originCity: "Paris",
      destinationCity: "London",
      departureDate,
      returnDate,
      adults: 1,
    });

    console.log(`✅ Flights OK: ${flights?.length || 0} offers found`);

    // Show only first 5 flights
    console.log("\nFirst 5 Flights:");
    flights.slice(0, 5).forEach((f, i) => {
      console.log(
        `${i + 1}. ${f.airline} - ${f.departure.time} -> ${f.arrival.time} | Price: ${f.price.total} ${f.price.currency}`
      );
    });
  } catch (err) {
    console.error("❌ Flights FAILED");
    console.error(err.message);
  }
};

const runTests = async () => {
  console.log("\n🚀 RUNNING API TESTS");

  await testHotels();
  await testFlights();

  console.log("\n🏁 TESTING COMPLETED");
};

runTests();
