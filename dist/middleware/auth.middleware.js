"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.cookies["auth_token"];
    console.log(token);
    if (!token)
        return res.status(401).json({ message: "unauthorized" });
    try {
        const decodedJwt = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedJwt);
        req.userId = decodedJwt.userId;
        console.log(decodedJwt.userId);
        next();
    }
    catch (error) {
        // Log the error
        console.error("Token verification error:", error);
        // Differentiate between error types
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "Token expired" });
        }
        else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            return res
                .status(401)
                .json({ error: "Unauthorized", message: "Invalid token" });
        }
        else {
            const errorMessage = error.message || "An unexpected error occurred";
            return res
                .status(500)
                .json({ error: "Internal Server Error", message: errorMessage });
        }
    }
};
exports.default = verifyToken;
