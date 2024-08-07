import { NextFunction, Request, Response } from "express";
import jwt, {
	JsonWebTokenError,
	JwtPayload,
	TokenExpiredError,
} from "jsonwebtoken";

// Define a custom property 'userId' on the Request object
declare global {
	namespace Express {
		interface Request {
			userId?: string;
		}
	}
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies["auth_token"];
	console.log("Token received:", token)
	if (!token) return res.status(401).json({ message: "unauthorized" });

	try {
		const decodedJwt = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
		console.log("Decoded JWT:", decodedJwt);
		req.userId = (decodedJwt as JwtPayload).userId;
		next();
	} catch (error) {
		// Log the error
		console.error("Token verification error:", error);

		// Differentiate between error types
		if (error instanceof TokenExpiredError) {
			return res.status(401).json({ error: "Unauthorized", message: "Token expired" });
		} else if (error instanceof JsonWebTokenError) {
			return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
		} else {
			const errorMessage = (error as any).message || "An unexpected error occurred";
			return res.status(500).json({ error: "Internal Server Error", message: errorMessage });
		}

	}
};

export default verifyToken;
