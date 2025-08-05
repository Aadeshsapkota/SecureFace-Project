import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [30, "Username cannot exceed 30 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      "Please enter a valid email address"
    ]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  verificationCode: {
    type: String,
    required: false
  },
  verificationCodeExpires: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  faceDescriptor: { 
    type: [Number], 
    default: [],
    validate: {
      validator: function(arr) {
        return arr.every(num => typeof num === "number");
      },
      message: "Face descriptor must be an array of numbers"
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
