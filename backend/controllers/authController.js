// Accept all usernames and passwords, return a dummy token
export const loginUser = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const fakeToken = "token-" + Date.now();
  res.status(200).json({ token: fakeToken });
};



// Minimal auth to obtain a JWT for protected project routes
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/User.js";

export async function register(req,res){
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password) return res.status(400).json({message:"Missing fields"});
    const exists = await findUserByEmail(email);
    if(exists) return res.status(400).json({message:"User already exists"});
    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(name,email,hash);
    res.status(201).json({message:"Registered", user});
  }catch(e){
    res.status(500).json({message:e.message});
  }
}

export async function login(req,res){
  try{
    const {email,password}=req.body;
    const user = await findUserByEmail(email);
    if(!user) return res.status(400).json({message:"User not found"});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({message:"Invalid credentials"});
    const token = jwt.sign({id:user.id}, process.env.JWT_SECRET || "dev_secret", {expiresIn:"2h"});
    res.json({message:"Login successful", token});
  }catch(e){
    res.status(500).json({message:e.message});
  }


}

exports.forgotPassword = async (req, res) => {
  console.log("--> Forgot Password İsteği Alındı. Body:", req.body);

  const { email } = req.body;

  // 1. E-posta boş mu geldi? (400 Hatası Sebebi Olabilir)
  if (!email) {
    console.log("HATA: Email alanı boş gönderildi.");
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  try {
    // 2. Kullanıcıyı bul
    const user = await User.findOne({ email });

    if (!user) {
      console.log("HATA: Bu e-posta ile kullanıcı bulunamadı:", email);
      // Güvenlik gereği 404 yerine 200 dönülebilir ama test için 404 dönelim
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Token oluştur (Simülasyon)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    console.log("---------------------------------------------------");
    console.log(`✅ RESET LINK (${email}):`);
    console.log(resetUrl);
    console.log("---------------------------------------------------");

    return res.status(200).json({ message: 'Reset link generated' });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ message: 'Server error processing request' });
  }
};
