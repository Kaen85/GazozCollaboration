// src/components/projects/ProjectTasks.js

import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api'; 
import { 
  FiPlus, FiCheckCircle, FiLoader, FiClock, FiLock, 
  FiMoreVertical, FiEdit, FiTrash2, FiSave, FiX, FiUser 
} from 'react-icons/fi';

export default function ProjectTasks() {
  const { currentProject, fetchTasks, createTask, deleteTask, updateTask } = useProjectContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const projectId = currentProject?.id;
  const userRole = currentProject?.currentUserRole;
  const canEdit = userRole !== 'public_viewer';

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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const newTask = await createTask(projectId, { 
        title: newTaskTitle, status: 'todo', due_date: new Date().toISOString() 
      });
      if (newTask) {
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
      }
    } catch (error) { console.error("Failed to create task:", error); }
  };

 const moveTask = async (task, newStatus) => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) return;

    const previousTasks = [...tasks];
    const updatedList = tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
    setTasks(updatedList);

    try {
        await api.put(`/api/projects/${projectId}/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      setTasks(previousTasks);
      alert(`Error moving task: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(projectId, taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) { console.error("Failed to delete task:", error); }
    }
  };

  const handleUpdateTaskTitle = async (taskId, newTitle) => {
    try {
      const updatedTask = await updateTask(projectId, taskId, { title: newTitle });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (error) { console.error("Failed to update task:", error); }
  };

  const handleDragStart = (e, taskId) => { e.dataTransfer.setData("taskId", taskId); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t.id === Number(taskId) || t.id === taskId);
    if (task && task.status !== newStatus) { moveTask(task, newStatus); }
  };

  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const weightedScore = doneCount + (inProgressCount * 0.5);
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((weightedScore / totalTasks) * 100);

  if (loading) return <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-primary" size={30}/></div>;
  
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-lg border border-border">
        <FiLock size={40} className="text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-text-main">Tasks are Private</h3>
        <p className="text-text-secondary mt-2">Only project members can see the task board.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. PROGRESS BAR */}
      <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-text-main font-semibold flex items-center">
            <FiCheckCircle className="mr-2 text-primary" /> Project Progress
          </h3>
          <span className="text-primary font-bold">{progressPercentage}% Completed</span>
        </div>
        <div className="w-full bg-app rounded-full h-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* 2. ADD TASK FORM */}
      {canEdit && (
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input 
            type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow bg-surface text-text-main border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-colors"
            placeholder="Add a new task..."
          />
          <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors">
            <FiPlus className="mr-2" /> Add Task
          </button>
        </form>
      )}

      {/* 3. KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        <KanbanColumn 
          title="To Do" status="todo" tasks={tasks} 
          borderColor="border-indigo-500" badgeColor="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          canEdit={canEdit} onMove={moveTask} onDelete={handleDeleteTask} onUpdate={handleUpdateTaskTitle} onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart}
        />
        <KanbanColumn 
          title="In Progress" status="in_progress" tasks={tasks} 
          borderColor="border-blue-500" badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          canEdit={canEdit} onMove={moveTask} onDelete={handleDeleteTask} onUpdate={handleUpdateTaskTitle} onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart}
        />
        <KanbanColumn 
          title="Done" status="done" tasks={tasks} 
          borderColor="border-purple-500" badgeColor="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
          canEdit={canEdit} onMove={moveTask} onDelete={handleDeleteTask} onUpdate={handleUpdateTaskTitle} onDragOver={handleDragOver} onDrop={handleDrop} onDragStart={handleDragStart}
        />
      </div>
    </div>
  );
}

function KanbanColumn({ title, status, tasks, borderColor, badgeColor, canEdit, onMove, onDelete, onUpdate, onDragOver, onDrop, onDragStart }) {
  const columnTasks = tasks.filter(t => t.status === status);
  return (
    // bg-surface: Sütun rengi
    <div className={`bg-surface rounded-xl border-t-4 ${borderColor} p-4 flex flex-col h-full shadow-lg border-x border-b border-border`} onDragOver={onDragOver} onDrop={(e) => onDrop(e, status)}>
      <h4 className="text-text-main font-bold mb-4 flex justify-between items-center">
        {title} 
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor}`}>{columnTasks.length}</span>
      </h4>
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-10">
        {columnTasks.map(task => (
          <TaskItem key={task.id} task={task} canEdit={canEdit} status={status} onMove={onMove} onDelete={onDelete} onUpdate={onUpdate} onDragStart={onDragStart}/>
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
    function handleClickOutside(event) { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== task.title) { onUpdate(task.id, editTitle); }
    setIsEditing(false);
  };

  return (
    // bg-app: Görev kartı rengi (Sütundan farklı olması için)
    <div 
      className={`bg-app p-3 rounded-lg border border-border hover:border-primary transition-all group relative ${canEdit ? 'cursor-move' : ''}`}
      draggable={canEdit}
      onDragStart={(e) => canEdit && onDragStart(e, task.id)}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-surface text-text-main text-sm p-1 rounded border border-primary focus:outline-none" autoFocus/>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-600"><FiX size={16}/></button>
            <button onClick={handleSaveEdit} className="text-green-500 hover:text-green-600"><FiSave size={16}/></button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <p className="text-text-main text-sm font-medium mb-2 break-words flex-1 pr-6">{task.title}</p>
            {canEdit && (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-secondary hover:text-text-main p-1 rounded-full hover:bg-surface-hover transition-colors">
                  <FiMoreVertical size={16} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-6 w-32 bg-surface border border-border rounded-md shadow-xl z-10 overflow-hidden">
                    <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-text-main hover:bg-surface-hover flex items-center">
                      <FiEdit className="mr-2" /> Edit
                    </button>
                    <button onClick={() => { onDelete(task.id); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-surface-hover flex items-center">
                      <FiTrash2 className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 mt-2">
             <div className="flex items-center text-xs text-text-secondary">
               <FiUser className="mr-1.5 w-3 h-3" />
               <span>Created by: <span className="text-text-main">{task.created_by_name || 'Unknown'}</span></span>
             </div>
             <div className="flex items-center text-xs text-text-secondary">
                <FiClock className="mr-1.5 w-3 h-3"/> 
                {new Date(task.created_at).toLocaleDateString()}
             </div>
          </div>
          {canEdit && (
            <div className="mt-3 pt-2 border-t border-border flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {status !== 'todo' && <button onClick={() => onMove(task, 'todo')} className="text-xs bg-surface border border-border hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-text-secondary hover:text-indigo-500 px-2 py-1 rounded transition-colors">To Do</button>}
              {status !== 'in_progress' && <button onClick={() => onMove(task, 'in_progress')} className="text-xs bg-surface border border-border hover:bg-blue-100 dark:hover:bg-blue-900/30 text-text-secondary hover:text-blue-500 px-2 py-1 rounded transition-colors">Progress</button>}
              {status !== 'done' && <button onClick={() => onMove(task, 'done')} className="text-xs bg-surface border border-border hover:bg-purple-100 dark:hover:bg-purple-900/30 text-text-secondary hover:text-purple-500 px-2 py-1 rounded transition-colors">Done</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}