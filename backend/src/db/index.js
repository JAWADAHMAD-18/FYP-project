import { DB_Name } from "../constants.js";
import mongoose from "mongoose";

const db_connection=async()=>{
    try {
        // use the MONGODB_URI environment variable value and append the DB name
        const connectionString = `${process.env.MONGODB_URI}${DB_Name}`;
        const db = await mongoose.connect(connectionString);
        console.log("Database connected", db.connection.name);
        return db;
    } catch (error) {
        console.log("db connection error in db folder ", error);
        process.exit(1);
    }
}
export default db_connection