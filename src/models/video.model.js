import mongoose from "mongoose"; 

const videoSchema = new mongoose.Schema({
	videosFile: [{
		type: String,
		required: true 
	}],
	thumbnail: {
		type: String,
		required: true 
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true 
	},
	duration: {
		type: Number
	},
	views: {
		type: Number
	},
	isPublished: {
		type: Boolean,
		required: true,
		default: false
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
}, {timestamps: true})


const Video = mongoose.model("Video", videoSchema);
export {Video};
