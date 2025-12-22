// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiCheckCircle, FiUsers, FiLayout, FiLayers, FiShield } from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    // text-white -> text-text-main (Temaya göre renk alır)
    <div className="min-h-screen font-sans text-text-main relative transition-colors duration-300">
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 fixed"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        {/* Overlay: 
            Light Mode: bg-white/90 (Resmi çok silikleştirir, metin okunur)
            Dark Mode: dark:bg-gray-900/90 (Karanlık mod atmosferi)
        */}
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-[2px] transition-colors duration-500"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* --- HEADER --- */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* Logo */}
             <img src={LogoImage} alt="GazozHub Logo" className="h-20 w-20 object-contain drop-shadow-lg brightness-0 dark:brightness-100 transition-all duration-300" />
             {/* text-white -> text-text-main */}
             <span className="text-3xl font-extrabold tracking-tight text-text-main">GazozHub</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                // bg-blue-600 -> bg-primary
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-primary/30 flex items-center"
              >
                Go to Dashboard <FiArrowRight className="ml-2" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  // text-gray-300 -> text-text-secondary, hover:text-white -> hover:text-text-main
                  className="px-4 py-2 text-text-secondary hover:text-text-main font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  // bg-white -> bg-primary, text-gray-900 -> text-white (Vurgulu buton)
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-all shadow-lg transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </header>

        {/* --- HERO SECTION --- */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 py-20">
          <div className="max-w-5xl mx-auto space-y-8">
           
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6 drop-shadow-2xl text-text-main">
              Collaboration <br />
              {/* Gradient metin aynen kalabilir, her iki temada da güzel durur */}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                Reimagined.
              </span>
            </h1>
            
            {/* text-gray-400 -> text-text-secondary */}
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light mb-10">
              GazozHub connects students, teams, and advisors in one seamless workspace. 
              Manage tasks, track issues, and build amazing things together.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5">
              {user ? (
                <Link 
                  to="/dashboard" 
                  // Gradient yerine bg-primary kullanarak tema tutarlılığı sağladık
                  className="px-10 py-4 bg-primary hover:bg-primary-hover text-white text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-primary/20 flex items-center justify-center"
                >
                  Launch Dashboard <FiArrowRight className="ml-3" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    // bg-white -> bg-primary
                    className="px-10 py-4 bg-primary hover:bg-primary-hover text-white text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center"
                  >
                    Get Started <FiArrowRight className="ml-3" size={24} />
                  </Link>
                  <Link 
                    to="/login" 
                    // bg-gray-800 -> bg-surface, border-gray-700 -> border-border
                    className="px-10 py-4 bg-surface hover:bg-surface-hover border border-border text-text-main text-xl font-bold rounded-2xl transition-all flex items-center justify-center backdrop-blur-sm"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* --- FEATURES GRID --- */}
          <div className="mt-[20vh] grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4">
            <FeatureCard 
              icon={<FiLayout className="w-8 h-8" />} 
              title="Kanban Boards" 
              desc="Visualise work with drag-and-drop boards. Move tasks from To Do to Done with ease."
              color="bg-blue-500"
            />
            <FeatureCard 
              icon={<FiUsers className="w-8 h-8" />} 
              title="Team Sync" 
              desc="Real-time collaboration with role-based access control for Editors and Viewers."
              color="bg-purple-500"
            />
            <FeatureCard 
              icon={<FiCheckCircle className="w-8 h-8" />} 
              title="Issue Tracking" 
              desc="Advanced issue tracking system to squash bugs and manage feature requests efficiently."
              color="bg-green-500"
            />
            <FeatureCard 
              icon={<FiLayers className="w-8 h-8" />} 
              title="Project Hub" 
              desc="Centralize all your project files, discussions, and milestones in one place."
              color="bg-pink-500"
            />
            <FeatureCard 
              icon={<FiShield className="w-8 h-8" />} 
              title="Secure & Private" 
              desc="Keep your projects private or share them publicly with granular visibility settings."
              color="bg-yellow-500"
            />
             
             {/* "And much more" Kartı */}
             <div className="p-8 rounded-3xl border border-border bg-surface/60 backdrop-blur-md flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold text-text-main mb-2">And much more...</h3>
                <p className="text-text-secondary">Join GazozHub today to explore all features.</p>
             </div>
          </div>
        </main>

        {/* --- FOOTER --- */}
        {/* border-gray-800 -> border-border, bg-gray-900 -> bg-surface/50 */}
        <footer className="py-8 text-center border-t border-border bg-surface/50 backdrop-blur-sm mt-auto">
           <div className="flex items-center justify-center gap-2 mb-2">
             <img src={LogoImage} alt="Logo" className="h-6 w-6 opacity-80" />
             {/* text-gray-500 -> text-text-secondary */}
             <span className="text-text-secondary font-semibold">GazozHub</span>
           </div>
           <p className="text-text-secondary text-sm">
             &copy; {new Date().getFullYear()} GazozHub. Designed for modern teams.
           </p>
        </footer>
      </div>
    </div>
  );
};

// Alt Bileşen: Özellik Kartı
// Renkler ve backgroundlar temaya uyarlandı
const FeatureCard = ({ icon, title, desc, color }) => (
  // bg-gray-900/60 -> bg-surface/80, border-gray-800 -> border-border
  <div className="group p-8 rounded-3xl border border-border bg-surface/80 backdrop-blur-md hover:bg-surface hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg">
    {/* İkon Kutusu */}
    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {/* İkon rengini dinamik olarak text-COLOR-500 yaptık, 'text-' + color class'ı React'te bazen sorun olabilir o yüzden style veya inline class daha güvenlidir ama burada basitçe text-primary gibi davranabiliriz veya color prop'unu kullanabiliriz */}
      <div className={`${color.replace('bg-', 'text-')}`}>{icon}</div> 
    </div>
    
    {/* Başlık: text-white -> text-text-main */}
    <h3 className="text-2xl font-bold text-text-main mb-3">{title}</h3>
    
    {/* Açıklama: text-gray-400 -> text-text-secondary */}
    <p className="text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;