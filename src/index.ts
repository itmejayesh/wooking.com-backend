import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import userRgister from "./routes/UserResgister.routes";
import userLogin from "./routes/UserLogin.routes";
import propertyListing from "./routes/PropertyListing.routes";
import propertySearch from "./routes/PropertySearch.routes"
import cookieParser from "cookie-parser";


mongoose.connect(process.env.MONGODB_CONNECTION_URL as string);

//basic app && middleware configurations must neended.
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	})
);

//Api Routes
app.use("/api/user", userLogin);
app.use("/api/user", userRgister);
app.use("/api/propertylisting", propertyListing);
app.use("/api/search", propertySearch);


app.listen(7000, () => {
	console.log("server is running on port 7000");
	app.get("/", (req, res) => {
		res.send({ message: "server is running" });
	});
});
