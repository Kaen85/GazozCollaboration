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
    <div className="min-h-screen font-sans text-white relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        {/* Daha modern bir gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-black/80"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* --- HEADER --- */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* Logo Büyütüldü: h-12 -> h-20 */}
             <img src={LogoImage} alt="GazozHub Logo" className="h-20 w-20 object-contain drop-shadow-lg" />
             <span className="text-3xl font-extrabold tracking-tight text-white">GazozHub</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-blue-500/30 flex items-center"
              >
                Go to Dashboard <FiArrowRight className="ml-2" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-full transition-all shadow-lg transform hover:-translate-y-0.5"
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
           
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6 drop-shadow-2xl">
              Collaboration <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Reimagined.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mb-10">
              GazozHub connects students, teams, and advisors in one seamless workspace. 
              Manage tasks, track issues, and build amazing things together.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-blue-900/20 flex items-center justify-center"
                >
                  Launch Dashboard <FiArrowRight className="ml-3" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-10 py-4 bg-white text-gray-900 hover:bg-gray-50 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center"
                  >
                    Get Started <FiArrowRight className="ml-3" size={24} />
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-10 py-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white text-xl font-bold rounded-2xl transition-all flex items-center justify-center backdrop-blur-sm"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* --- FEATURES GRID --- */}
          <div className="mt-[40vh] grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4">
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
             <div className="p-8 rounded-3xl border border-gray-800 bg-gray-900/40 backdrop-blur-md flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold text-white mb-2">And much more...</h3>
                <p className="text-gray-400">Join GazozHub today to explore all features.</p>
             </div>
          </div>
        </main>

        {/* --- FOOTER --- */}
        <footer className="py-8 text-center border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm mt-auto">
           <div className="flex items-center justify-center gap-2 mb-2">
             <img src={LogoImage} alt="Logo" className="h-6 w-6 opacity-50" />
             <span className="text-gray-500 font-semibold">GazozHub</span>
           </div>
           <p className="text-gray-600 text-sm">
             &copy; {new Date().getFullYear()} GazozHub. Designed for modern teams.
           </p>
        </footer>
      </div>
    </div>
  );
};

// Alt Bileşen: Özellik Kartı
const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group p-8 rounded-3xl border border-gray-800 bg-gray-900/60 backdrop-blur-md hover:bg-gray-800/80 hover:border-gray-700 transition-all duration-300">
    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center text-${color.split('-')[1]}-400 mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;