import mongoose from "mongoose"; 

const tweetSchema = new mongoose.Schema({
	content: {
		type: String
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}
}, {timestamps: true})


const Tweet = mongoose.model("Tweet", tweetSchema);
export {Tweet};