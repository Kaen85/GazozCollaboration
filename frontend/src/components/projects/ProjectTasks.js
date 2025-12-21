// src/components/projects/ProjectTasks.js

import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api'; // <--- BU SATIR EKLENDİ (ÖNEMLİ)
import { 
  FiPlus, FiCheckCircle, FiLoader, FiClock, FiLock, 
  FiMoreVertical, FiEdit, FiTrash2, FiSave, FiX, FiUser 
} from 'react-icons/fi';

export default function ProjectTasks() {
  // Context'ten sadece create ve delete fonksiyonlarını alıyoruz
  const { currentProject, fetchTasks, createTask, deleteTask, updateTask } = useProjectContext();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const projectId = currentProject?.id;
  const userRole = currentProject?.currentUserRole;
  const canEdit = userRole !== 'public_viewer'; 

  // Görevleri Yükle
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchTasks(projectId).then(data => {
        if (data === null) {
          setAccessDenied(true); 
        } else {
          setTasks(data);
          setAccessDenied(false);
        }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Yeni Görev Ekle
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const newTask = await createTask(projectId, { 
        title: newTaskTitle, 
        status: 'todo',
        due_date: new Date().toISOString() 
      });
      
      if (newTask) {
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // === DÜZELTME BURADA: Görev Taşıma ve API İsteği ===
 const moveTask = async (task, newStatus) => {
    // 1. DIAGNOSTIC: Check if Token exists in Browser Storage
    const savedToken = localStorage.getItem('token');
    
    if (!savedToken) {
      alert("CRITICAL ERROR: You are NOT logged in!\n\nReason: 'token' is missing from localStorage.\n\nSolution: Please Log Out and Log In again.");
      console.error("Local Storage is empty!", localStorage);
      return; 
    }

    // 2. Optimistic Update
    const previousTasks = [...tasks];
    const updatedList = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    setTasks(updatedList);

    // 3. Send Request
    try {
        console.log(`📡 Sending Request with Token: ${savedToken.substring(0, 10)}...`);
        
        await api.put(`/api/projects/${projectId}/tasks/${task.id}`, {
            status: newStatus
        });

        console.log("✅ Success!");

    } catch (error) {
      console.error("❌ Error:", error);
      setTasks(previousTasks); // Rollback

      if (error.response && error.response.status === 401) {
         alert("ERROR 401: The token exists but is invalid or expired.\n\nPlease Log Out and Log In again.");
      } else if (error.response) {
         alert(`SERVER ERROR (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else {
         alert(`ERROR: ${error.message}`);
      }
    }
  };

  // Görev Silme
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(projectId, taskId); 
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  // Görev Başlığı Güncelleme
  const handleUpdateTaskTitle = async (taskId, newTitle) => {
    try {
      const updatedTask = await updateTask(projectId, taskId, { title: newTitle });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  // === DRAG AND DROP HANDLERS ===
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t.id === Number(taskId) || t.id === taskId); // ID tip dönüşümü kontrolü
    
    if (task && task.status !== newStatus) {
      moveTask(task, newStatus);
    }
  };

  // === İLERLEME DURUMU HESAPLA ===
  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const weightedScore = doneCount + (inProgressCount * 0.5);
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((weightedScore / totalTasks) * 100);

  if (loading) return <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-blue-500" size={30}/></div>;

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-lg border border-gray-700">
        <FiLock size={40} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white">Tasks are Private</h3>
        <p className="text-gray-400 mt-2">Only project members can see the task board.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. PROGRESS BAR */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-semibold flex items-center">
            <FiCheckCircle className="mr-2 text-purple-400" /> Project Progress
          </h3>
          <span className="text-blue-400 font-bold">{progressPercentage}% Completed</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-400 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 2. GÖREV EKLEME FORMU */}
      {canEdit && (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Add a new task..."
          />
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center">
            <FiPlus className="mr-2" /> Add Task
          </button>
        </form>
      )}

      {/* 3. KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        <KanbanColumn 
          title="To Do" 
          status="todo" 
          tasks={tasks} 
          borderColor="border-indigo-500"
          badgeColor="bg-indigo-500/20 text-indigo-300"
          canEdit={canEdit}
          onMove={moveTask}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTaskTitle}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        />
        <KanbanColumn 
          title="In Progress" 
          status="in_progress" 
          tasks={tasks} 
          borderColor="border-blue-500" 
          badgeColor="bg-blue-500/20 text-blue-300"
          canEdit={canEdit}
          onMove={moveTask}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTaskTitle}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        />
        <KanbanColumn 
          title="Done" 
          status="done" 
          tasks={tasks} 
          borderColor="border-purple-500" 
          badgeColor="bg-purple-500/20 text-purple-300"
          canEdit={canEdit}
          onMove={moveTask}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTaskTitle}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
        />
      </div>
    </div>
  );
}

// Kanban Kolonu ve TaskItem bileşenleri aynı kalacak...
// Sadece TaskItem içinde Draggable özelliği için onDragStart prop'unu doğru geçirdiğimizden emin oluyoruz.

function KanbanColumn({ title, status, tasks, borderColor, badgeColor, canEdit, onMove, onDelete, onUpdate, onDragOver, onDrop, onDragStart }) {
  const columnTasks = tasks.filter(t => t.status === status);

  return (
    <div 
      className={`bg-gray-800 rounded-xl border-t-4 ${borderColor} p-4 flex flex-col h-full shadow-lg`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <h4 className="text-white font-bold mb-4 flex justify-between items-center">
        {title} 
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>
          {columnTasks.length}
        </span>
      </h4>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-10">
        {columnTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            canEdit={canEdit} 
            status={status}
            onMove={onMove}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
}

function TaskItem({ task, canEdit, status, onMove, onDelete, onUpdate, onDragStart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-all group relative ${canEdit ? 'cursor-move' : ''}`}
      draggable={canEdit}
      onDragStart={(e) => canEdit && onDragStart(e, task.id)}
    >
      
      {/* Düzenleme Modu */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input 
            type="text" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm p-1 rounded border border-blue-500 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300"><FiX size={16}/></button>
            <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><FiSave size={16}/></button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <p className="text-white text-sm font-medium mb-2 break-words flex-1 pr-6">{task.title}</p>
            
            {/* 3 Nokta Menü */}
            {canEdit && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <FiMoreVertical size={16} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-6 w-32 bg-gray-800 border border-gray-600 rounded-md shadow-xl z-10 overflow-hidden">
                    <button 
                      onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center"
                    >
                      <FiEdit className="mr-2" /> Edit
                    </button>
                    <button 
                      onClick={() => { onDelete(task.id); setIsMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-gray-700 flex items-center"
                    >
                      <FiTrash2 className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
             <div className="flex items-center text-xs text-gray-400">
               <FiUser className="mr-1.5 w-3 h-3" />
               <span>Created by: <span className="text-gray-300">{task.created_by_name || 'Unknown'}</span></span>
             </div>
             
             <div className="flex items-center text-xs text-gray-500">
                <FiClock className="mr-1.5 w-3 h-3"/> 
                {new Date(task.created_at).toLocaleDateString()}
             </div>
          </div>

          {/* Hareket Butonları */}
          {canEdit && (
            <div className="mt-3 pt-2 border-t border-gray-600/50 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {status !== 'todo' && (
                <button onClick={() => onMove(task, 'todo')} className="text-xs bg-gray-600 hover:bg-indigo-600 text-white px-2 py-1 rounded transition-colors">To Do</button>
              )}
              {status !== 'in_progress' && (
                <button onClick={() => onMove(task, 'in_progress')} className="text-xs bg-gray-600 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors">Progress</button>
              )}
              {status !== 'done' && (
                <button onClick={() => onMove(task, 'done')} className="text-xs bg-gray-600 hover:bg-purple-600 text-white px-2 py-1 rounded transition-colors">Done</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}