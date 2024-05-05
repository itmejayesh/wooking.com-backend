import mongoose, {Document, Schema} from "mongoose";

export interface PropertyType extends Document {
	userId: string;
	name: string;
	location: string;
	city: string;
	country: string;
	description: string;
	type: string;
	adultsCount: number;
	childCount: number;
	facilities: string[];
	pricePerNights: number;
	starRating: number;
	imageUrl: string[];
	lastUpdated: Date;
}

const PropertySchema = new mongoose.Schema<PropertyType>({
	userId: {type: String, required: true},
	name: {type: String, required: true},
	location: {type: String, required: true},
	city: {type: String, required: true},
	country: {type: String, required: true},
	description: {type: String, required: true},
	type: {type: String, required: true},
	adultsCount: {type: Number, required: true},
	childCount: {type: Number, required: true},
	facilities: [{type: String, required: true}],
	pricePerNights: {type: Number, required: true},
	starRating: {type: Number, require: true, min: 1, max: 5},
	imageUrl: [{type: String, required: true}],
	lastUpdated: {type: Date, default: Date.now},
});

const Property = mongoose.model<PropertyType>("Property", PropertySchema);

export default Property;
