// frontend/src/components/projects/ProjectTasks.js

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useProjectContext } from '../../context/ProjectContext';
import api from '../../services/api'; 
import { 
  FiPlus, FiCheckCircle, FiLoader, FiClock, FiLock, 
  FiMoreVertical, FiEdit, FiTrash2, FiSave, FiX, FiUser, FiLayout, FiCalendar 
} from 'react-icons/fi';

export default function ProjectTasks() {
  const { currentProject, fetchTasks, createTask, deleteTask } = useProjectContext();
  
  // --- Data States ---
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [members, setMembers] = useState([]); // Project members for assignment
  
  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // --- Input States ---
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const projectId = currentProject?.id;
  const userRole = currentProject?.currentUserRole;
  
  // Permissions
  const isOwner = userRole === 'owner';
  const canEditTasks = userRole !== 'public_viewer';

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (projectId) {
      setLoading(true);
      
      Promise.all([
        fetchTasks(projectId),
        api.get(`/api/projects/${projectId}/columns`),
        api.get(`/api/projects/${projectId}/members`) // Fetch members
      ]).then(([tasksData, colsResponse, membersResponse]) => {
        
        // Process Columns
        const dbColumns = colsResponse.data;
        const newCols = {};
        const newOrder = [];
            
        dbColumns.sort((a,b) => a.position - b.position).forEach(c => {
            newCols[c.column_id] = { id: c.column_id, title: c.title, isFixed: c.is_fixed };
            newOrder.push(c.column_id);
        });
            
        setColumns(newCols);
        setColumnOrder(newOrder);
        
        // Set other data
        // Fix: Ensure tasksData is an array to prevent crashes
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setMembers(membersResponse.data || []);
        setLoading(false);

      }).catch(err => {
        console.error("Error loading board data:", err);
        setTasks([]); // Set empty array on error
        setLoading(false);
      });
    }
  }, [projectId]);

  // --- 2. HANDLERS ---

  // Create New Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const newTask = await createTask(projectId, { 
        title: newTaskTitle, status: 'todo', due_date: null 
      });
      if (newTask) {
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
      }
    } catch (error) { console.error("Failed to create task:", error); }
  };

  // Create New Column
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '_');

    if (columns[columnId]) {
      alert("A column with this name already exists.");
      return;
    }

    try {
      const response = await api.post(`/api/projects/${projectId}/columns`, {
        title: newColumnTitle,
        column_id: columnId,
        position: columnOrder.length
      });

      const newColumn = { 
          id: response.data.column_id, 
          title: response.data.title, 
          isFixed: response.data.is_fixed 
      };

      setColumns({ ...columns, [newColumn.id]: newColumn });
      setColumnOrder([...columnOrder, newColumn.id]);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    } catch (error) {
      if (error.response?.data?.message) alert(error.response.data.message);
      else alert("Could not save column.");
    }
  };

  // Delete Column
  const handleDeleteColumn = async (columnId) => {
    if (columns[columnId]?.isFixed) {
      alert("Default columns cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete "${columns[columnId].title}"?`)) return;

    const newColumnOrder = columnOrder.filter(id => id !== columnId);
    const newColumns = { ...columns };
    delete newColumns[columnId];

    setColumnOrder(newColumnOrder);
    setColumns(newColumns);

    try {
      await api.delete(`/api/projects/${projectId}/columns/${columnId}`);
    } catch (error) { console.error("Failed to delete column:", error); }
  };

  // --- UPDATE TASK (Fixed Saving Issue) ---
  const handleUpdateTaskData = async (taskId, updates) => {
    // 1. Optimistic UI Update
    const oldTasks = [...tasks];
    setTasks(prevTasks => prevTasks.map(t => {
        if (t.id === taskId) {
            // Update assignee name locally for immediate UI feedback
            let newAssigneeName = t.assignee_name;
            if (updates.assigned_to) {
                const member = members.find(m => m.id === updates.assigned_to);
                newAssigneeName = member ? member.username : null;
            } else if (updates.assigned_to === null || updates.assigned_to === "") {
                newAssigneeName = null;
            }
            return { ...t, ...updates, assignee_name: newAssigneeName };
        }
        return t;
    }));

    try {
      // 2. Send to Backend
      // Ensure empty strings are sent as NULL
      const payload = { ...updates };
      if (payload.assigned_to === "") payload.assigned_to = null;
      if (payload.due_date === "") payload.due_date = null;

      await api.put(`/api/projects/${projectId}/tasks/${taskId}`, payload);
      
    } catch (error) { 
      console.error("Failed to update task:", error);
      setTasks(oldTasks); // Revert on error
      alert("Failed to save changes.");
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      try {
        await deleteTask(projectId, taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (error) { console.error("Failed to delete task:", error); }
    }
  };

  // --- 3. DRAG & DROP LOGIC ---
  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Reorder Columns
    if (type === 'COLUMN') {
      if (!isOwner) return;
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      setColumnOrder(newColumnOrder);
      try {
        await api.put(`/api/projects/${projectId}/columns/reorder`, { newOrder: newColumnOrder });
      } catch (error) { console.error("Failed to save order:", error); }
      return;
    }

    // Move Tasks
    const finishStatus = destination.droppableId;
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => 
      t.id === draggableId || t.id === Number(draggableId) 
        ? { ...t, status: finishStatus } 
        : t
    );
    setTasks(updatedTasks);

    try {
        await api.put(`/api/projects/${projectId}/tasks/${draggableId}`, { status: finishStatus });
    } catch (error) {
      fetchTasks(projectId).then(data => setTasks(data)); // Revert if failed
    }
  };

  // --- STATS & PROGRESS (Fixed Crash) ---
  // We use optional chaining (?.) and defaults (|| 0) to prevent crashes if tasks is undefined
  const totalTasks = tasks?.length || 0;
  
  const doneCount = tasks?.filter(t => t.status === 'done').length || 0;
  const inProgressCount = tasks?.filter(t => t.status === 'in_progress').length || 0;
  
  // Logic: Done = 100%, In Progress = 50%
  const weightedScore = doneCount + (inProgressCount * 0.5);
  
  const progressPercentage = totalTasks === 0 
    ? 0 
    : Math.min(100, Math.round((weightedScore / totalTasks) * 100));

  if (loading) return <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-primary" size={30}/></div>;
  if (accessDenied) return <div className="p-10 text-center"><FiLock size={40} className="text-red-500 mx-auto mb-2"/><h3 className="text-text-main font-bold">Access Denied</h3></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      
      {/* HEADER */}
      <div className="flex-none mb-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-2xl font-bold text-text-main flex items-center">
              <FiCheckCircle className="mr-3 text-primary" /> Kanban Board
           </h2>
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

        {/* PROGRESS BAR */}
        <div className="bg-surface p-3 rounded-lg border border-border shadow-sm flex items-center gap-4">
           <span className="text-xs font-bold text-text-secondary uppercase tracking-wider whitespace-nowrap">Progress</span>
           <div className="w-full bg-app rounded-full h-2 overflow-hidden border border-border">
             <div 
               className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-500" 
               style={{ width: `${progressPercentage}%` }}
             ></div>
           </div>
           <span className="text-xs font-bold text-primary whitespace-nowrap">{progressPercentage}%</span>
        </div>
      </div>

      {/* BOARD */}
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
                if (!column) return null;
                
                // Fix: Ensure tasks is array before filtering
                const columnTasks = tasks?.filter(t => t.status === columnId) || [];

                return (
                  <KanbanColumn 
                    key={column.id} 
                    column={column} 
                    tasks={columnTasks} 
                    index={index}
                    isOwner={isOwner}
                    canEditTasks={canEditTasks}
                    onDeleteColumn={handleDeleteColumn}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTask={handleUpdateTaskData}
                    members={members}
                  />
                );
              })}
              {provided.placeholder}

              {/* ADD COLUMN BUTTON */}
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

function KanbanColumn({ column, tasks, index, isOwner, canEditTasks, onDeleteColumn, onDeleteTask, onUpdateTask, members }) {
  return (
    <Draggable draggableId={column.id} index={index} isDragDisabled={!isOwner}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="flex flex-col min-w-[260px] max-w-[260px] h-full"
        >
          {/* Header */}
          <div 
            {...provided.dragHandleProps}
            className="p-3 bg-surface border border-border rounded-t-xl flex justify-between items-center shadow-sm cursor-grab active:cursor-grabbing group"
          >
            <div className="flex items-center gap-2 font-bold text-text-main text-sm uppercase tracking-wide select-none flex-1">
                {column.title}
                <span className="text-[10px] bg-app px-1.5 py-0.5 rounded text-text-secondary border border-border">{tasks.length}</span>
            </div>
            
            {/* Delete Button (Only if not fixed) */}
            {isOwner && !column.isFixed && (
              <button 
                onClick={() => onDeleteColumn(column.id)}
                className="p-1 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Column"
              >
                <FiTrash2 size={14} />
              </button>
            )}
            
            {isOwner && <FiMoreVertical className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" size={14} />}
          </div>

          {/* Task List */}
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
                    members={members}
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

function TaskItem({ task, index, canEdit, onDelete, onUpdate, members }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editAssignee, setEditAssignee] = useState(task.assigned_to || '');
  const [editDate, setEditDate] = useState(
    task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
  );

  const handleSave = () => {
    const updates = {};
    if (editTitle.trim() !== task.title) updates.title = editTitle;
    
    // Assignee Change
    const oldAssignee = task.assigned_to || '';
    if (editAssignee !== oldAssignee) {
        updates.assigned_to = editAssignee; // Passed as "" if unassigned
    }

    // Date Change
    const oldDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
    if (editDate !== oldDate) {
        updates.due_date = editDate; // Passed as "" if cleared
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(task.id, updates);
    }
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

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
                 placeholder="Task Title..."
               />
               
               {/* ASSIGNEE SELECTOR (Dark Mode Fixed) */}
               <div className="flex items-center gap-1 bg-app border border-border rounded px-1">
                 <FiUser className="text-text-secondary" size={12}/>
                 <select 
                   value={editAssignee} 
                   onChange={(e) => setEditAssignee(e.target.value)}
                   className="w-full bg-transparent text-text-main text-xs p-1 outline-none cursor-pointer"
                 >
                   <option value="" className="bg-white text-black dark:bg-gray-800 dark:text-white">
                     Unassigned
                   </option>
                   {members && members.map(m => (
                     <option 
                       key={m.id} 
                       value={m.id} 
                       className="bg-white text-black dark:bg-gray-800 dark:text-white"
                     >
                       {m.username}
                     </option>
                   ))}
                 </select>
               </div>

               {/* DATE PICKER */}
               <div className="flex items-center gap-1 bg-app border border-border rounded px-1">
                 <FiCalendar className="text-text-secondary" size={12}/>
                 <input 
                   type="date"
                   value={editDate}
                   onChange={(e) => setEditDate(e.target.value)}
                   className="w-full bg-transparent text-text-main text-xs p-1 outline-none cursor-pointer"
                 />
               </div>

               <div className="flex justify-end gap-2 mt-1">
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
                 <div className="flex items-center text-[10px] text-text-secondary font-bold" title="Assignee">
                    <FiUser className="mr-1"/> 
                    {task.assignee_name || <span className="italic font-normal opacity-50">Unassigned</span>}
                 </div>
                 
                 {task.due_date && (
                   <div className={`flex items-center text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-text-secondary'}`} title="Due Date">
                      <FiClock className="mr-1"/> 
                      {formatDate(task.due_date)}
                   </div>
                 )}
              </div>
            </>
          )}
        </div>
      )}
    </Draggable>
  );
}