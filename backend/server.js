// server.js — Express app entry
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ensureTables } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create tables if not exist
ensureTables().then(()=>console.log("✅ DB ready")).catch(e=>console.error("DB init error:", e.message));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Simple health
app.get("/api/health", (_,res)=>res.json({ok:true}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log("API on http://localhost:"+PORT));
