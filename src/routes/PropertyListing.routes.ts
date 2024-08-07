import express, { Request, Response } from "express";
import Property, { PropertyType } from "../models/Property.model";
import verifyToken from "../middleware/auth.middleware";
import { body } from "express-validator";
import { upload } from "../middleware/multer.middleware";
import { uploadImageOnCloudinary } from "../utils/cloudinary";

const router = express.Router();

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
			.isInt({ min: 1 })
			.withMessage("Adults count must be a positive integer"),
		body("childCount")
			.notEmpty()
			.withMessage("Child count is required")
			.isInt({ min: 0 })
			.withMessage("Child count must be a non-negative integer"),
		body("facilities").isArray().withMessage("Facilities must be an array"),
		body("pricePerNights")
			.notEmpty()
			.withMessage("Price per night is required")
			.isNumeric()
			.withMessage("Price per night must be a number")
			.isFloat({ min: 0 })
			.withMessage("Price per night must be a non-negative number"),
		// Add additional validation rules as needed
	],
	upload.array("imageFiles", 6),
	async (req: Request, res: Response) => {
		try {
			// Todos
			// check getting imagefiles
			// 1, uload the images to cloudinary
			// 2, if upload is successful, add the URLS into the data base
			// 3, save the uploaded in database
			// 4, return 201 status code

			const imageFiles = req.files as Express.Multer.File[] | undefined;

			if (!imageFiles) {
				return res.status(400).json({ message: "No files uploaded" });
			}

			const newListing: PropertyType = req.body;

			const uploadPromises = imageFiles.map(file => uploadImageOnCloudinary(file.path));
			const imgUrls = await Promise.all(uploadPromises);
			const validImgUrls = imgUrls.filter(url => url !== null) as string[];
			if (validImgUrls.length === 0) {
				return res.status(400).json({ message: "Failed to upload images" });
			}
			newListing.imageUrl = validImgUrls;
			newListing.lastUpdated = new Date();
			if (req.userId) newListing.userId = req.userId;

			const property = new Property(newListing);
			await property.save();

			res.status(201).send(property);
		} catch (error) {
			console.log(error, "Error creating property listing");
			res.status(500).json({ message: "Inter server error" });
		}
	}
);

router.get(`/`, verifyToken, async (req: Request, res: Response) => {

	//database call for fetching properties
	try {
		const userId = req.userId;

		// Ensure userId is valid and sanitized
		if (!userId) {
			return res.status(400).json({ message: "Invalid user ID" });
		} else {
			console.log("UserId Is Vaild for fetching req", userId)
		}

		const properties = await Property.find({ userId });
		if (!properties.length) {
			return res.status(404).json({ message: "No properties found" });
		}

		// Return the fetched properties
		res.status(200).json(properties);

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error feching property" });
	}
})

export default router;
