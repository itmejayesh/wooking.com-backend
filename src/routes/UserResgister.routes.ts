import express, {Request, Response} from "express";
import User from "../models/User.model";
import jwt from "jsonwebtoken";
import {check, validationResult} from "express-validator";

const router = express.Router();

router.post(
	"/register",
	[
		check("email", "email is required").isEmail(),
		check(
			"password",
			" password min length 6 and max length 10 required"
		).isLength({min: 6, max: 10}),
		check("firstName", "first name is required").isString(),
		check("lastName", "last name is required").isString(),
	],
	async (req: Request, res: Response) => {
		const errorsResult = validationResult(req);
		if (!errorsResult.isEmpty()) {
			return res.status(400).json({message: errorsResult.array()});
		}
		try {
			//check if user is already registered
			const existingUser = await User.findOne({
				email: req.body.email,
			});

			if (existingUser)
				return res.status(400).json({message: "User already exists"});

			const newUser = new User({
				email: req.body.email,
				password: req.body.password,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
			});
			``;
			await newUser.save();
			const token = jwt.sign(
				{userID: newUser.id},
				process.env.JWT_SECRET_KEY as string,
				{
					expiresIn: "1d",
				}
			);

			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 86400000,
			});

			return res.status(201).json({message: "User registered successfully"});
		} catch (error) {
			console.error("Error registering user:", error);
			return res.status(500).json({message: "Internal server error"});
		}
	}
);

export default router;
