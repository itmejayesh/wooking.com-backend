import express, {Request, Response} from "express";
import {check, validationResult} from "express-validator";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post(
	"/login",
	[
		check("email", "Email is required").isEmail(),
		check("password", "Password must be between 8 and 10 characters").isLength({
			max: 10,
			min: 8,
		}),
	],
	async (req: Request, res: Response) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({errors: errors.array()});
		}

		const {email, password} = req.body;

		try {
			//check if email is valid
			const user = await User.findOne({email: email});
			if (!user) return res.status(400).json({message: "Invalid credentials"});

			//check if password is valid
			const isPasswordMatch = await bcrypt.compare(password, user.password);
			if (!isPasswordMatch)
				return res.status(400).json({message: "Password do not match"});

			//token generate
			const token = jwt.sign(
				{userId: user.id},
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

			return res.status(200).json({userId: user._id});
		} catch (error: any) {
			console.error("Login error:", error.message);
			return res.status(500).json({message: "Server error"});
		}
	}
);

export default router;
