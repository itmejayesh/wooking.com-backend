"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const UserResgister_routes_1 = __importDefault(require("./routes/UserResgister.routes"));
const UserLogin_routes_1 = __importDefault(require("./routes/UserLogin.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
mongoose_1.default.connect(process.env.MONGODB_CONNECTION_URL);
//basic app && middleware configurations must neended.
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
//Api Routes
app.use("/api/user", UserLogin_routes_1.default);
app.use("/api/user", UserResgister_routes_1.default);
app.listen(7000, () => {
    console.log("server is running on port 7000");
});
