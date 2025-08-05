import mongoose from "mongoose";

const UserFaceSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures username is unique
    trim: true
  },
  descriptor: {
    type: [[Number]], // Array of arrays of numbers (e.g., Face API descriptors)
    required: true
  }
}, { timestamps: true });

export default  mongoose.model("UserFace", UserFaceSchema);


