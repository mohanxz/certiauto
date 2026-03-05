// src/components/common/Layout/Navbar.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className={`
      border-b px-6 py-4 transition-colors duration-300
      ${isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className={`lg:hidden mr-4 transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="fas fa-bars text-xl"></i>
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <i className="fas fa-calendar-alt mr-2"></i>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className={`
            p-2 rounded-lg transition-colors relative
            ${isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-600'
            }
          `}>
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative">
            <button 
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-indigo-600' : 'bg-blue-600'
              }`}>
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  {user?.name || 'User'}
                </p>
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.role || 'Admin'}
                </p>
              </div>
              <i className={`fas fa-chevron-down text-xs hidden md:block ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}></i>
            </button>

            {showDropdown && (
              <div className={`
                absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50
                ${isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className={`px-4 py-3 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {user?.name || 'User'}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                
                <button className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  ${isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <i className="fas fa-user mr-2"></i>Profile
                </button>
                
                <button className={`
                  w-full text-left px-4 py-2 text-sm transition-colors
                  ${isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}>
                  <i className="fas fa-cog mr-2"></i>Settings
                </button>
                
                <button
                  onClick={logout}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors
                    ${isDarkMode 
                      ? 'text-red-400 hover:bg-red-900/20' 
                      : 'text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;