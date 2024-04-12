import mongoose, {Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";

interface UserType extends Document {
	_id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

const userSchema: Schema<UserType> = new mongoose.Schema({
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	// Check if the password field has been modified (or is new)
	try {
		if (!this.isModified("password")) return next();

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(this.password, salt);
		this.password = hash;
		next();
	} catch (error: any) {
		return next(error);
	}
});

const User = mongoose.model<UserType>("User", userSchema);

export default User;
