import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    postTitle: {
      type: String,
      required: true
    },
    postDescription: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
