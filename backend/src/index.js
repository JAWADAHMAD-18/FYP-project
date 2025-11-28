import dotenv from "dotenv";
import app from "./app.js";
import db_connection from "./db/index.js";
import { connectRedis } from "./config/redis.config.js";
// load environment variables from backend/.env (src is one level deeper)
dotenv.config({ path: "../.env" });

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    const connection = await db_connection();
    await connectRedis();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(
      "tere is connection error during the database connection in index js",
      error
    );
    process.exit(1);
  }
};

startServer();
