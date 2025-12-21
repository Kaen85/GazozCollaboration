// src/components/layout/RightSidebar.js

import React from 'react';
import { FiChevronsRight, FiX, FiInfo, FiLayers } from 'react-icons/fi';

// selectedProject prop'unu ekledik. Bu prop null ise boş kalacak, doluysa bilgileri basacak.
function RightSidebar({ isOpen, toggleSidebar, selectedProject }) {

  return (
    <div 
      className={`${
        isOpen ? 'w-80 border-l px-6' : 'w-0 px-0 border-none'
      } bg-gray-800 border-gray-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative h-full`}
    >
      {/* --- İÇERİK ALANI --- */}
      <div className="w-80 pt-6 flex-1 overflow-y-auto pb-20">
        
        {/* HEADER: Başlık ve Üst Kapatma Butonu */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-lg text-white tracking-wide">
            {selectedProject ? 'Project Details' : 'Details'}
          </h3>
          
          <button 
            onClick={toggleSidebar}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* --- DURUMA GÖRE İÇERİK --- */}
        {selectedProject ? (
          // DURUM 1: BİR PROJE SEÇİLİYSE BURASI GÖZÜKÜR
          <div className="animate-fade-in">
            
            {/* Proje Başlığı */}
            <div className="mb-6">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 block">
                Current Project
              </span>
              <h2 className="text-2xl font-bold text-white break-words">
                {selectedProject.name}
              </h2>
            </div>

            {/* Proje Açıklaması (Varsa) */}
            {selectedProject.description && (
              <div className="mb-6">
                <h4 className="flex items-center text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  <FiInfo className="mr-2" /> Description
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>
            )}

            {/* Proje Meta Bilgileri (Örnek: Oluşturulma tarihi vs. varsa buraya eklenir) */}
            <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-700">
               <div className="flex items-center text-gray-400 text-sm">
                  <FiLayers className="mr-2" />
                  <span>Project ID: <span className="text-gray-200 font-mono text-xs">{selectedProject.id}</span></span>
               </div>
            </div>

          </div>
        ) : (
          // DURUM 2: PROJE SEÇİLİ DEĞİLSE BURASI GÖZÜKÜR (BOŞ DURUM)
          <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
            <FiLayers size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 text-sm">No project selected.</p>
            <p className="text-gray-600 text-xs mt-1">Select a project to view details.</p>
          </div>
        )}

      </div>

      {/* --- ALT KISIMDAKİ KAPATMA BUTONU --- */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-700 bg-gray-800 z-10">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center py-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-colors group"
          title="Close Sidebar"
        >
          <FiChevronsRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}

export default RightSidebar;