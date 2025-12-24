// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import the theme hook
import { 
  FiArrowRight, FiCheckCircle, FiUsers, FiLayout, 
  FiLayers, FiShield, FiSun, FiMoon 
} from 'react-icons/fi';
import BackgroundImage from '../assets/background.jpg';
import LogoImage from '../assets/logo.png';

const LandingPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Access theme state

  return (
    <div className="min-h-screen font-sans text-text-main relative transition-colors duration-300">
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 fixed"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-[2px] transition-colors duration-500"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* --- HEADER --- */}
        <header className="container mx-auto px-6 py-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 bg-transparent">
          <div className="flex items-center gap-1">
             <img src={LogoImage} alt="GazozHub Logo" className="h-20 w-20 object-contain drop-shadow-lg brightness-0 dark:brightness-100 transition-all duration-300" />
             <span className="text-3xl font-extrabold tracking-tight text-text-main">GazozHub</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* --- THEME TOGGLE BUTTON --- */}
            <button
              onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative flex items-center justify-between w-16 h-8 p-1 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none shadow-inner"
              aria-label="Toggle Theme"
            >
              <div
                className={`absolute w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-8 bg-indigo-500' : 'translate-x-0 bg-amber-400'
                }`}
              >
                {theme === 'dark' ? (
                  <FiMoon className="text-white w-4 h-4" />
                ) : (
                  <FiSun className="text-white w-4 h-4" />
                )}
              </div>
              <FiSun className={`ml-1 w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'opacity-0'}`} />
              <FiMoon className={`mr-1 w-4 h-4 ${theme === 'light' ? 'text-gray-400' : 'opacity-0'}`} />
            </button>

            {/* Existing Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-primary/30 flex items-center"
                >
                  Go to Dashboard <FiArrowRight className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 text-text-secondary hover:text-text-main font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full transition-all shadow-lg transform hover:-translate-y-0.5">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* --- HERO SECTION --- */}
        <main className="flex-grow flex flex-col items-center">
          
          <section className="min-h-screen flex flex-col justify-center items-center text-center px-4">
            <div className="max-w-5xl mx-auto space-y-8">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-6 drop-shadow-2xl text-text-main">
                Collaboration <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  Reimagined.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed font-light mb-10">
                GazozHub connects students, teams, and advisors in one seamless workspace. 
                Manage tasks, track issues, and build amazing things together.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-5">
                {user ? (
                  <Link to="/dashboard" className="px-10 py-4 bg-primary hover:bg-primary-hover text-white text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-primary/20 flex items-center justify-center">
                    Launch Dashboard <FiArrowRight className="ml-3" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="px-10 py-4 bg-primary hover:bg-primary-hover text-white text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center">
                      Get Started <FiArrowRight className="ml-3" size={24} />
                    </Link>
                    <Link to="/login" className="px-10 py-4 bg-surface hover:bg-surface-hover border border-border text-text-main text-xl font-bold rounded-2xl transition-all flex items-center justify-center backdrop-blur-sm">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="absolute bottom-10 animate-bounce text-text-secondary">
              <p className="text-sm font-medium mb-2">Scroll to explore</p>
              <div className="flex justify-center">↓</div>
            </div>
          </section>

          {/* --- FEATURES GRID --- */}
          <div className="pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full px-4 mt-20">
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
             
             <div className="p-8 rounded-3xl border border-border bg-surface/60 backdrop-blur-md flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-bold text-text-main mb-2">And much more...</h3>
                <p className="text-text-secondary">Join GazozHub today to explore all features.</p>
             </div>
          </div>
        </main>

        <footer className="py-8 text-center border-t border-border bg-surface/50 backdrop-blur-sm mt-auto">
           <div className="flex items-center justify-center gap-2 mb-2">
             <img src={LogoImage} alt="Logo" className="h-6 w-6 opacity-80" />
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

// Sub-component: Feature Card
const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="group p-8 rounded-3xl border border-border bg-surface/80 backdrop-blur-md hover:bg-surface hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg">
    <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      <div className={`${color.replace('bg-', 'text-')}`}>{icon}</div> 
    </div>
    <h3 className="text-2xl font-bold text-text-main mb-3">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;