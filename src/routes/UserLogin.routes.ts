import express, {Request, Response} from "express";
import {check, validationResult} from "express-validator";
import User from "../models/User.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth.middleware";

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
		console.log(email, password);
		try {
			//check if email is valid
			const user = await User.findOne({email: email});
			if (!user) return res.status(400).json({message: "Invalid credentials"});

			//check if password is valid
			const isPasswordMatch = await bcrypt.compare(password, user.password);
			if (!isPasswordMatch)
				return res.status(400).json({message: "Password do not match"});

			console.log(process.env.JWT_SECRET_KEY);
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
			console.error("Login error:", error);
			return res.status(500).json({message: "Server error"});
		}
	}
);

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
	try {
		return res.status(200).json({userId: req.userId});
		// res.status(200).json({message: "hello user token"});
	} catch (error: any) {
		console.error("Token validation error:", error.message);
		res.status(401).json({message: "Unauthorized"});
	}
});

router.post("/logout", (req: Request, res: Response) => {
	try {
		res
			.cookie("auth_token", "", {
				expires: new Date(0),
			})
			.json({message: "Logout successful"}); // Return a success message
	} catch (error) {
		console.error("Error during logout:", error);
		res.status(500).json({error: "Internal server error"}); // Return an error response
	}
});

export default router;
