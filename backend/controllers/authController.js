import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplate.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to our platform",
      text: `Hello ${name}, welcome to our platform. Your account has been created with email id: ${email}`,
    }

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, user });
    
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

export const logout = (req, res) => {
    try{
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.json({success: true, message: "Logged out"});
    } catch(err){
        res.json({success: false, message: "Server error"});
    }
}

export const sendVerifyOtp = async (req, res) => {
    try{
      const {userId} = req.body;
      const user = await userModel.findById(userId);
      if(user.isAccoutVerified){
        return res.status(400).json({success: false, message: "Accout already verified"});
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
      await user.save();

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account Verification OTP",
        // text: `Your OTP for account verification is ${otp}`,
        html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
      };

      await transporter.sendMail(mailOptions);

      return res.json({success: true, message: "OTP sent successfully"});
    } catch(err){
      res.json({success: false, message: "Server error"});
    }
}


export const verifyEmail = async (req, res) => {
    const {userId, otp} = req.body;
    if(!userId || !otp){
      return res.status(400).json({success: false, message: "Missing Details"});
    }
    try{
      const user = await userModel.findById(userId);
      if(!user){
        return res.status(400).json({success: false, message: "Invalid User"});
      }
      if(user.verifyOtp === "" || user.verifyOtp !== otp){
        return res.status(400).json({success: false, message: "Invalid OTP"});
      }

      if(user.verifyOtpExpireAt < Date.now()){
        return res.status(400).json({success: false, message: "OTP expired"});
      }

      user.isAccountVerified = true;
      user.verifyOtp = "";
      user.verifyOtpExpireAt = null;

      await user.save();
      return res.json({success: true, message: "Account verified successfully"});
    } catch(err){
      res.json({success: false, message: "Server error"});
    }
}

export const isAuthenticated = async(req, res) => {
  try{
    return res.json({success: true});
  } catch(err){
    res.json({success: false, message: "Server error"});
  }
}

export const sendResetOtp = async(req, res) => {
  const {email} = req.body;
  if(!email){
    return res.json(400).json({success: false, message: "email is required"});
  }
  try{
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success: false, message: "User not found"});
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      // text: `Your OTP for password reset is ${otp}`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };

    await transporter.sendMail(mailOptions);

    return res.json({success: true, message: "OTP sent successfully"});
  } catch(err){
    return res.json({success: false, message: "Server error"});
  }
}

export const resetPassword = async(req, res) => {
  const {email, otp, newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res.json(400).json({success: false, message: "All fields are required"});
  }
  try{
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success: false, message: "User not found"});
    }

    if(user.resetOtp === "" || user.resetOtp !== otp){
      return res.json({success: false, message: "Invalid OTP"});
    }

    if(user.resetOtpExpireAt < Date.now()){
      return res.json({success: false, message: "OTP expired"});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({success: true, message: "Password reset successfully"});
  } catch(err){
    return res.json({success: false, message: "Server error"});
  }
}