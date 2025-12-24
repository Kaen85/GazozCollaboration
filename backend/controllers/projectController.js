// Projects: create, list, details
import { createProject, listMyProjects, listSharedProjects, getProjectById } from "../models/Project.js";

// POST /api/projects  (auth required)
export async function create(req,res){
  try{
    const { title, description, visibility } = req.body;
    if(!title) return res.status(400).json({message:"Title is required"});
    const project = await createProject(req.user.id, { title, description, visibility });
    res.status(201).json({message:"Created", project});
  }catch(e){
    res.status(500).json({message:e.message});
  }
}

// GET /api/projects/mine  (auth required)
export async function mine(req,res){
  try{
    const projects = await listMyProjects(req.user.id);
    res.json({ projects });
  }catch(e){
    res.status(500).json({message:e.message});
  }
}

// GET /api/projects/shared  (public)
export async function shared(req, res) {
  try {
    // ÖNEMLİ: listSharedProjects fonksiyonuna giriş yapan kullanıcının ID'sini gönderiyoruz
    const projects = await listSharedProjects(req.user.id); 
    res.json({ projects });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

// GET /api/projects/:id  (auth required; owner or shared)
export async function details(req,res){
  try{
    const project = await getProjectById(req.params.id);
    if(!project) return res.status(404).json({message:"Not found"});
    if(project.visibility !== "shared" && project.owner_id !== req.user.id){
      return res.status(403).json({message:"Forbidden"});
    }
    res.json({ project });
  }catch(e){
    res.status(500).json({message:e.message});
  }
}

