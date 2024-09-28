import mongoose from "mongoose"; 
import {DB_NAME} from "../constants/constant.js";

const DB_CONNECT = async ()=> {
	try {
		const connection = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`);
		console.log("mongoDB connected on host: ", connection.connection.host);
	} catch(err) {
		console.log("MongoDB connection failed: ", err.message);
	}
}

export {DB_CONNECT};
