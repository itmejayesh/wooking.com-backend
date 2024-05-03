"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_model_1 = __importDefault(require("../models/User.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const router = express_1.default.Router();
router.post("/login", [
    (0, express_validator_1.check)("email", "Email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password must be between 8 and 10 characters").isLength({
        max: 10,
        min: 8,
    }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    console.log(email, password);
    try {
        //check if email is valid
        const user = yield User_model_1.default.findOne({ email: email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });
        //check if password is valid
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatch)
            return res.status(400).json({ message: "Password do not match" });
        console.log(process.env.JWT_SECRET_KEY);
        //token generate
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d",
        });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000,
        });
        return res.status(200).json({ userId: user._id });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}));
router.get("/validate-token", auth_middleware_1.default, (req, res) => {
    try {
        return res.status(200).json({ userId: req.userId });
        // res.status(200).json({message: "hello user token"});
    }
    catch (error) {
        console.error("Token validation error:", error.message);
        res.status(401).json({ message: "Unauthorized" });
    }
});
router.post("/logout", (req, res) => {
    try {
        res
            .cookie("auth_token", "", {
            expires: new Date(0),
        })
            .json({ message: "Logout successful" }); // Return a success message
    }
    catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ error: "Internal server error" }); // Return an error response
    }
});
exports.default = router;
