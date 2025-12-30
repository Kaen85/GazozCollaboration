// src/components/projects/ProjectTasks.js

import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api'; 
import { 
  FiPlus, FiCheckCircle, FiLoader, FiClock, FiLock, 
  FiMoreVertical, FiEdit, FiTrash2, FiSave, FiX, FiUser, FiLayout 
} from 'react-icons/fi';

// Default columns configuration
const INITIAL_COLUMNS = {
  todo: { id: 'todo', title: 'To Do', isFixed: true },
  in_progress: { id: 'in_progress', title: 'In Progress', isFixed: true },
  done: { id: 'done', title: 'Done', isFixed: true }
};

export default function ProjectTasks() {
  const { currentProject, fetchTasks, createTask, deleteTask, updateTask } = useProjectContext();
  
  // State for Tasks
  const [tasks, setTasks] = useState([]);
  
  // State for Columns (Order and Data)
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [columnOrder, setColumnOrder] = useState(['todo', 'in_progress', 'done']);
  
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // New Task Input State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // New Column Input State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const projectId = currentProject?.id;
  const userRole = currentProject?.currentUserRole;
  
  // Permissions
  const isOwner = userRole === 'owner';
  const canEditTasks = userRole !== 'public_viewer';

  // --- 1. Load Data ---
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchTasks(projectId).then(data => {
        if (data === null) {
          setAccessDenied(true); 
        } else {
          setTasks(data);
          
          // Detect if there are tasks with custom statuses not in initial columns
          // This is a simple way to restore custom columns from DB data if they exist
          const uniqueStatuses = [...new Set(data.map(t => t.status))];
          const newCols = { ...INITIAL_COLUMNS };
          const newOrder = ['todo', 'in_progress', 'done'];

          uniqueStatuses.forEach(status => {
            if (!newCols[status]) {
              newCols[status] = { id: status, title: status.replace(/_/g, ' '), isFixed: false };
              newOrder.push(status);
            }
          });

          setColumns(newCols);
          setColumnOrder(newOrder);
          setAccessDenied(false);
        }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // --- 2. Handlers ---

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

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    // Create a slug-like ID for the status
    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '_');
    
    if (columns[columnId]) {
      alert("A column with this name already exists.");
      return;
    }

    const newColumn = { id: columnId, title: newColumnTitle, isFixed: false };
    
    setColumns({ ...columns, [columnId]: newColumn });
    setColumnOrder([...columnOrder, columnId]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleRenameColumn = (columnId, newTitle) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: { ...prev[columnId], title: newTitle }
    }));
  };

  // --- 3. Drag & Drop Logic ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // --- REORDERING COLUMNS ---
    if (type === 'COLUMN') {
      if (!isOwner) return; // Only owner can move columns
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      setColumnOrder(newColumnOrder);
      // Note: Ideally, save this order to backend
      return;
    }

    // --- MOVING TASKS ---
    const startStatus = source.droppableId;
    const finishStatus = destination.droppableId;

    // Optimistic UI Update
    const updatedTasks = tasks.map(t => 
      t.id === draggableId || t.id === Number(draggableId) 
        ? { ...t, status: finishStatus } 
        : t
    );
    setTasks(updatedTasks);

    try {
        await api.put(`/api/projects/${projectId}/tasks/${draggableId}`, { status: finishStatus });
    } catch (error) {
      alert(`Error moving task: ${error.message}`);
      // Revert on error (re-fetch or undo state)
      fetchTasks(projectId).then(data => setTasks(data));
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

  // --- Statistics ---
  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  if (loading) return <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-primary" size={30}/></div>;
  if (accessDenied) return <div className="p-10 text-center"><FiLock size={40} className="text-red-500 mx-auto mb-2"/><h3 className="text-text-main font-bold">Access Denied</h3></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      
      {/* HEADER & PROGRESS */}
      <div className="flex-none mb-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold text-text-main flex items-center">
              <FiCheckCircle className="mr-3 text-primary" /> Kanban Board
           </h2>
           {/* Add Task Form (Top) */}
           {canEditTasks && (
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input 
                type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-surface text-text-main border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-colors w-64"
                placeholder="Quick add task..."
              />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-md transition-colors">
                <FiPlus />
              </button>
            </form>
           )}
        </div>

        <div className="bg-surface p-3 rounded-lg border border-border shadow-sm flex items-center gap-4">
           <span className="text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Progress</span>
           <div className="w-full bg-app rounded-full h-2 overflow-hidden border border-border">
             <div className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
           </div>
           <span className="text-xs font-bold text-primary whitespace-nowrap">{progressPercentage}%</span>
        </div>
      </div>

      {/* KANBAN BOARD AREA */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden pb-4 items-start h-full"
            >
              {columnOrder.map((columnId, index) => {
                const column = columns[columnId];
                const columnTasks = tasks.filter(t => t.status === columnId);

                return (
                  <KanbanColumn 
                    key={column.id} 
                    column={column} 
                    tasks={columnTasks} 
                    index={index}
                    isOwner={isOwner}
                    canEditTasks={canEditTasks}
                    onRename={handleRenameColumn}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTaskTitle}
                  />
                );
              })}
              {provided.placeholder}

              {/* ADD NEW COLUMN BUTTON (Only Owner) */}
              {isOwner && (
                <div className="min-w-[260px] max-w-[260px]">
                  {isAddingColumn ? (
                    <div className="bg-surface p-3 rounded-xl border border-border shadow-sm animate-fade-in">
                      <input 
                        autoFocus
                        type="text" 
                        value={newColumnTitle} 
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        className="w-full bg-app border border-border rounded px-2 py-1 text-sm text-text-main mb-2 focus:border-primary outline-none"
                        placeholder="Column Name..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsAddingColumn(false)} className="text-xs text-text-secondary hover:text-text-main font-bold">Cancel</button>
                        <button onClick={handleAddColumn} className="px-3 py-1 bg-primary text-white rounded text-xs font-bold">Add</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingColumn(true)}
                      className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center font-bold text-sm"
                    >
                      <FiLayout className="mr-2"/> Add Column
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

// --- SUB COMPONENTS ---

function KanbanColumn({ column, tasks, index, isOwner, canEditTasks, onRename, onDeleteTask, onUpdateTask }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  const handleTitleSubmit = () => {
    if (title.trim() && title !== column.title) {
      onRename(column.id, title);
    }
    setIsEditingTitle(false);
  };

  return (
    <Draggable draggableId={column.id} index={index} isDragDisabled={!isOwner}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="flex flex-col min-w-[260px] max-w-[260px] h-full"
        >
          {/* Column Header */}
          <div 
            {...provided.dragHandleProps}
            className="p-3 bg-surface border border-border rounded-t-xl flex justify-between items-center shadow-sm cursor-grab active:cursor-grabbing group"
          >
            {isEditingTitle ? (
              <input 
                autoFocus
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                className="w-full bg-app text-sm text-text-main px-1 rounded border border-primary outline-none"
              />
            ) : (
              <div 
                onDoubleClick={() => { if(isOwner && !column.isFixed) setIsEditingTitle(true) }}
                className="flex items-center gap-2 font-bold text-text-main text-sm uppercase tracking-wide select-none"
                title={isOwner && !column.isFixed ? "Double click to rename" : ""}
              >
                {column.title}
                <span className="text-[10px] bg-app px-1.5 py-0.5 rounded text-text-secondary border border-border">{tasks.length}</span>
              </div>
            )}
            
            {/* Drag Handle Indicator (Visual only) */}
            {isOwner && <FiMoreVertical className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" size={14} />}
          </div>

          {/* Task List Droppable */}
          <Droppable droppableId={column.id} type="TASK">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex-1 p-2 bg-app/50 border-x border-b border-border rounded-b-xl overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/10' : ''}`}
              >
                {tasks.map((task, idx) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    index={idx} 
                    canEdit={canEditTasks} 
                    onDelete={onDeleteTask} 
                    onUpdate={onUpdateTask}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

function TaskItem({ task, index, canEdit, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if(editTitle.trim() && editTitle !== task.title) onUpdate(task.id, editTitle);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={String(task.id)} index={index} isDragDisabled={!canEdit}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-surface p-3 mb-2 rounded-lg border border-border shadow-sm group hover:border-primary/50 transition-all ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary rotate-2' : ''}`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
               <textarea 
                 autoFocus
                 value={editTitle}
                 onChange={(e) => setEditTitle(e.target.value)}
                 className="w-full bg-app text-text-main text-xs p-2 rounded border border-primary focus:outline-none resize-none"
                 rows="2"
               />
               <div className="flex justify-end gap-2">
                 <button onClick={() => setIsEditing(false)} className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"><FiX/></button>
                 <button onClick={handleSave} className="text-xs text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 rounded"><FiSave/></button>
               </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-text-main leading-snug">{task.title}</p>
                {canEdit && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                    <button onClick={() => setIsEditing(true)} className="p-1 text-text-secondary hover:text-primary"><FiEdit size={12}/></button>
                    <button onClick={() => onDelete(task.id)} className="p-1 text-text-secondary hover:text-red-500"><FiTrash2 size={12}/></button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                 <div className="flex items-center text-[10px] text-text-secondary font-bold">
                    <FiUser className="mr-1"/> {task.created_by_name || '...'}
                 </div>
                 <div className="flex items-center text-[10px] text-text-secondary">
                    <FiClock className="mr-1"/> {new Date(task.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                 </div>
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}