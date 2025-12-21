// src/components/layout/RightSidebar.js

import React from 'react';
import { FiClock, FiCheckCircle, FiChevronsRight } from 'react-icons/fi';

function RightSidebar({ isOpen, toggleSidebar }) {
  
  // Örnek veriler
  const upcomingDeadlines = [
    { id: 1, title: 'Database Design', date: 'Due Tomorrow', color: 'text-red-400' },
    { id: 2, title: 'Frontend Setup', date: 'Due in 2 days', color: 'text-yellow-400' },
  ];

  const recentActivity = [
    { id: 1, user: 'Ali', action: 'completed a task', time: '2h ago' },
    { id: 2, user: 'Ayse', action: 'commented on API', time: '4h ago' },
    { id: 3, user: 'Mehmet', action: 'uploaded file', time: '1d ago' },
  ];

  return (
    <div 
      className={`${
        isOpen ? 'w-80 border-l px-6' : 'w-0 px-0 border-none'
      } bg-gray-800 border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative`}
    >
      {/* İÇERİK WRAPPER (Genişlik 0 olunca içeriğin bozulmaması için sabit genişlikli div) */}
      <div className="w-80 pt-6">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-white">Activity & Tasks</h3>
          {/* Kapatma Butonu (Activity başlığının yanında opsiyonel) */}
        </div>

        {/* Deadlines Section */}
        <div className="mb-8">
          <h4 className="flex items-center text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            <FiClock className="mr-2" /> Upcoming Deadlines
          </h4>
          <div className="space-y-3">
            {upcomingDeadlines.map((item) => (
              <div key={item.id} className="p-3 bg-gray-700 rounded-lg hover:bg-gray-650 transition cursor-pointer">
                <p className="font-medium text-gray-200">{item.title}</p>
                <p className={`text-xs mt-1 ${item.color}`}>{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h4 className="flex items-center text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            <FiCheckCircle className="mr-2" /> Recent Activity
          </h4>
          <div className="space-y-4">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-start pb-3 border-b border-gray-700 last:border-0">
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-200 mr-3 flex-shrink-0">
                  {act.user.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{act.user}</span> {act.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- ALT KISIMDAKİ OK İŞARETİ (KAPATMA) --- */}
      {/* Absolute positioning ile en alta sabitliyoruz */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700 bg-gray-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Close Sidebar"
        >
          {/* Sağa doğru ok (Dışarı doğru) */}
          <FiChevronsRight size={24} />
        </button>
      </div>

    </div>
  );
}

export default RightSidebar;