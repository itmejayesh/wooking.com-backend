import express, {Request, Response} from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Property, {PropertyType} from "../models/Property.model";
import verifyToken from "../middleware/auth.middleware";
import {body} from "express-validator";

const router = express.Router();

//multer configuration according to documentation
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, //5MB
	},
});

router.post(
	"/",
	verifyToken,
	[
		body("name").notEmpty().withMessage("Name is required"),
		body("city").notEmpty().withMessage("City is required"),
		body("country").notEmpty().withMessage("Country is required"),
		body("description").notEmpty().withMessage("Description is required"),
		body("type").notEmpty().withMessage("Type is required"),
		body("adultsCount")
			.notEmpty()
			.withMessage("Adults count is required")
			.isInt({min: 1})
			.withMessage("Adults count must be a positive integer"),
		body("childCount")
			.notEmpty()
			.withMessage("Child count is required")
			.isInt({min: 0})
			.withMessage("Child count must be a non-negative integer"),
		body("facilities").isArray().withMessage("Facilities must be an array"),
		body("pricePerNights")
			.notEmpty()
			.withMessage("Price per night is required")
			.isNumeric()
			.withMessage("Price per night must be a number")
			.isFloat({min: 0})
			.withMessage("Price per night must be a non-negative number"),
		// Add additional validation rules as needed
	],
	upload.array("imagesFiles", 6),
	async (req: Request, res: Response) => {
		try {
			// Todos
			// 1, uload the images to cloudinary
			// 2, if upload is successful, add the URLS into the data base
			// 3, save the uploaded in database
			// 4, return 201 status code

			const imageFiles = req.files as Express.Multer.File[];
			const newListing: PropertyType = req.body;

			const uploadPromise = imageFiles.map(async (image) => {
				const b64 = Buffer.from(image.buffer).toString("base64");
				let dataURI = "data:" + image.mimetype + ";base64," + b64;
				const res = await cloudinary.v2.uploader.upload(dataURI);
				return res.url;
			});

			const imgUrls = await Promise.all(uploadPromise);

			newListing.imageUrl = imgUrls;
			newListing.lastUpdated = new Date();
			if (req.userId) newListing.userId = req.userId;

			const property = new Property(newListing);
			await property.save();

			res.status(201).send(property);
		} catch (error) {
			console.log(error, "Error creating property listing");
			res.status(500).json({message: "Inter server error"});
		}
	}
);

export default router;
