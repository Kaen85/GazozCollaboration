import { useEffect, useState } from "react";
import api from './services/api';
import './App.css';

function App() {
   const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/').then(res => setMessage(res.data));
  }, []);

  return <h1>{message}</h1>
}

export default App;

import React, { useState } from 'react';

/*
  English: CreateTaskForm component
  Türkçe: CreateTaskForm bileşeni

  Props:
    - projectId: number, project to which the task belongs
    - onCreated: function, callback fired with created task object
*/
export default function CreateTaskForm({ projectId = 1, onCreated }) {
  // English: state variables for form fields
  // Türkçe: form alanları için state değişkenleri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('normal');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // English: helper to get API base from env
  // Türkçe: env'den API baz URL al
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ||
                   process.env.REACT_APP_API_BASE ||
                   'http://localhost:4000';

  // English: form submit handler - calls backend create endpoint
  // Türkçe: form submit handler - backend create endpoint'ini çağırır
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // English: basic form validation
    // Türkçe: temel form doğrulaması
    if (!title.trim()) return setError('Title is required / Başlık gerekli');

    setLoading(true);
    try {
      // English: prepare body object for API
      // Türkçe: API gönderilecek body nesnesi
      const body = {
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        priority,
        assignee_id: assigneeId ? Number(assigneeId) : null,
        due_date: dueDate || null,
        created_by: 1 // English: prototyping with fixed user id (replace with auth)
                     // Türkçe: prototip için sabit user id (auth ile değiştir)
      };

      // English: call API
      // Türkçe: API'yi çağır
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        // English: display backend error if available
        // Türkçe: backend hatasını göster
        throw new Error(data.error || 'Server error / Sunucu hatası');
      }

      // English: clear form after success
      // Türkçe: başarılıysa formu temizle
      setTitle(''); setDescription(''); setAssigneeId(''); setPriority('normal'); setDueDate('');

      // English: notify parent component
      // Türkçe: parent bileşeni bilgilendir
      if (onCreated) onCreated(data);
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Error / Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // English: small UI with Tailwind classes (can be adapted)
  // Türkçe: Tailwind sınıfları ile küçük bir UI (istediğin gibi düzenleyebilirsin)
  return (
    <form onSubmit={handleSubmit} className="max-w-xl p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Create New Task / Yeni Görev Oluştur</h3>

      {error && <div className="mb-2 text-red-600">{error}</div>}

      <label className="block mb-2">
        <span className="text-sm font-medium">Title / Başlık</span>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
          placeholder="E.g. Write intro section / Örn: Giriş bölümünü yaz"
        />
      </label>

      <label className="block mb-2">
        <span className="text-sm font-medium">Description / Açıklama</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
          rows="4"
          placeholder="Optional detailed description / Opsiyonel detaylı açıklama"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <label className="block">
          <span className="text-sm">Assignee ID / Atanan (ID)</span>
          <input
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="User ID (for prototype) / Kullanıcı ID (prototip)"
          />
        </label>

        <label className="block">
          <span className="text-sm">Priority / Öncelik</span>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="mt-1 block w-full border rounded p-2">
            <option value="low">Low / Düşük</option>
            <option value="normal">Normal</option>
            <option value="high">High / Yüksek</option>
          </select>
        </label>
      </div>

      <label className="block mb-3">
        <span className="text-sm">Due date / Bitiş Tarihi</span>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border rounded p-2" />
      </label>

      <div className="flex items-center gap-2">
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">
          {loading ? 'Creating... / Oluşturuluyor...' : 'Create / Oluştur'}
        </button>
        <button type="button" onClick={() => { setTitle(''); setDescription(''); setAssigneeId(''); setPriority('normal'); setDueDate(''); }} className="px-4 py-2 rounded border">
          Reset / Temizle
        </button>
      </div>
    </form>
  );
}