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
const User_model_1 = __importDefault(require("../models/User.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.post("/register", [
    (0, express_validator_1.check)("email", "email is required").isEmail(),
    (0, express_validator_1.check)("password", " password min length 6 and max length 10 required").isLength({ min: 6, max: 10 }),
    (0, express_validator_1.check)("firstName", "first name is required").isString(),
    (0, express_validator_1.check)("lastName", "last name is required").isString(),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errorsResult = (0, express_validator_1.validationResult)(req);
    if (!errorsResult.isEmpty()) {
        return res.status(400).json({ message: errorsResult.array() });
    }
    try {
        //check if user is already registered
        const existingUser = yield User_model_1.default.findOne({
            email: req.body.email,
        });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });
        const newUser = new User_model_1.default({
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });
        ``;
        yield newUser.save();
        const token = jsonwebtoken_1.default.sign({ userID: newUser.id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d",
        });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000,
        });
        return res.status(201).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
