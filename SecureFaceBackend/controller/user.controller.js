import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';
import UserFace from '../models/userface.model.js'




export const registerUser = async (req, res) => {
  const { username, email, password ,conformPassword} = req.body;

  if (!username || !email || !password ||!conformPassword ) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if(password !==conformPassword){
    res.status(400).json({error:"Password does not match"})
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }
    
      const hashedPassword = await bcrypt.hash(password, 10);
      const Code = Math.floor(1000 + Math.random() * 9000).toString();

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode:Code,
      });
      newUser.save();

     
        try {
          await sendVerificationEmail(email,Code);
        } catch (error) {
          return res.status(400).json({ error: 'Error sending email to the user' });
        }
      
      return res.status(201).json({ success : true ,message: 'User is registered SucessFully , Enter verification code to log in', user: newUser });
    }
    catch(error){
      return res.status(500).json({message:"Error while registering user"})
    }
};


export const loginUser = async (req, res) => {
  const { email, password,mfaCode } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    //compare mfa code
    if(mfaCode !== user.verificationCode){
      return res.status(400).json({error:'Code Did not match '})
    }
    user.isVerified = true;
    // If you want to return user info (excluding password)
    const { password: _, ...userData } = user._doc;


    return res.status(200).json({ success:true , message: 'Login successful', user: userData });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};



export const verifyUserCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findById(email);
    if (!user || user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    return res.status(200).json({ message: 'Verification successful' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
// New endpoint for storing face descriptor after verification
export const registerFace = async (req, res) => {
  const { username, descriptor } = req.body;

  if (!username || !descriptor) {
    return res.status(400).json({ error: 'username and face descriptor required' });
  }

  try {
    const user = await UserFace.findOne({ username });
    if (user) return res.status(404).json({ error: 'User already exist' });

    // Save descriptor (Float32Array -> Array)
    const newFaceUser = new UserFace({
      username,
      descriptor
    })
    await newFaceUser.save();

    return res.status(200).json({  success:true ,message: 'Face registered successfully' });
  } catch (err) {
    console.error('Face registration error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

//login using face data
export const loginWithFace = async (req, res) => {
  const { username, descriptor } = req.body;

  if (!username || !descriptor) {
    return res.status(400).json({ error: 'username and face data are required' });
  }

  try {
    const user = await UserFace.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Face data not found for this user' });
    }

    const THRESHOLD = 0.6; // More realistic tolerance
    let matchFound = false;

    // Convert new descriptor
    const inputDescriptor = new Float32Array(descriptor);

    // Ensure stored descriptor(s) are always arrays
    const storedDescriptors = Array.isArray(user.descriptor[0])
      ? user.descriptor // multiple descriptors
      : [user.descriptor]; // single descriptor

    // Compare with each stored descriptor
    for (const stored of storedDescriptors) {
      const storedArray = new Float32Array(stored);
      const distance = Math.sqrt(
        storedArray.reduce((sum, val, i) => sum + Math.pow(val - inputDescriptor[i], 2), 0)
      );

      console.log(`Distance for ${username}:`, distance);

      if (distance < THRESHOLD) {
        matchFound = true;
        break;
      }
    }

    if (matchFound) {
      const userData = user;
      console.log(user)
      return res.status(200).json({ success: true, message: 'Face login successful', userData  });
      
    } else {
      return res.status(401).json({ error: 'Face does not match' });
    }

  } catch (error) {
    console.error('Face login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
