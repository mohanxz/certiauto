// src/components/common/Layout/Sidebar.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import logo from "../../../assets/images/logo.png";
import ThemeToggle from "../../ui/ThemeToggle";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [logsOpen, setLogsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const logsRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (logsOpen && logsRef.current) {
      logsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [logsOpen]);

  useEffect(() => {
    if (settingsOpen && settingsRef.current) {
      settingsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [settingsOpen]);

  const menuItems = [
    { path: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
    { path: "/programs", icon: "fas fa-project-diagram", label: "Programs" },
    { path: "/batches", icon: "fas fa-layer-group", label: "Batches" },
    { path: "/courses", icon: "fas fa-graduation-cap", label: "Courses" },
    { path: "/students", icon: "fas fa-users", label: "Students" },
    { path: "/bulk-email", icon: "fas fa-paper-plane", label: "Bulk Email Sender" },
  ];

  const settingsItems = [
    { path: "/email-config", icon: "fas fa-envelope-open-text", label: "Mail Config" },
    { path: "/templates", icon: "fas fa-file", label: "Certi Templates" },
    { path: "/mail-templates", icon: "fas fa-envelope", label: "Mail Templates" },
  ];

  const logItems = [
    { path: "/bulk-email-logs", icon: "fas fa-mail-bulk", label: "Campaign Logs" },
    { path: "/upload-logs", icon: "fas fa-upload", label: "Bulk Upload Logs" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-20 lg:hidden transition-opacity duration-300 ${
            isDarkMode ? 'bg-black/70' : 'bg-black/50'
          }`}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-all duration-300 ease-in-out
          flex flex-col overflow-hidden
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          } border-r
        `}
      >
        {/* Logo */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-col items-center justify-center relative">
            <img
              src={logo}
              alt="Certiauto Logo"
              className="w-12 h-9 mb-1 opacity-90"
            />

            <h1 className={`text-sm font-semibold tracking-wide ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Certiauto
            </h1>

            <button
              onClick={toggleSidebar}
              className={`lg:hidden absolute top-0 right-0 ${
                isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-indigo-900/30' : 'bg-blue-100'
            }`}>
              <i className={`fas fa-user ${
                isDarkMode ? 'text-indigo-400' : 'text-blue-600'
              }`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {user?.name || "User"}
              </p>
              <p className={`text-xs truncate ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {user?.role || "Admin"}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Toggle - Add this after user info */}
        <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Theme
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => {
                    const baseClasses = "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200";
                    if (isActive) {
                      return `${baseClasses} ${
                        isDarkMode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                      }`;
                    }
                    return `${baseClasses} ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`;
                  }}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                >
                  <i className={`${item.icon} w-5 text-center`} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Settings Accordion */}
            <li ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-cog w-5 text-center" />
                  <span className="font-medium">Settings</span>
                </div>
                <i
                  className={`fas fa-chevron-${settingsOpen ? "up" : "down"} text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
              </button>

              {settingsOpen && (
                <div className={`ml-4 mt-1 space-y-1 pl-3 border-l ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {settingsItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => {
                        const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200";
                        if (isActive) {
                          return `${baseClasses} ${
                            isDarkMode
                              ? 'bg-indigo-600 text-white'
                              : 'bg-blue-50 text-blue-600'
                          }`;
                        }
                        return `${baseClasses} ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`;
                      }}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                    >
                      <i className={`${item.icon} w-4 text-center text-xs`} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </li>

            {/* Logs & History */}
            <li ref={logsRef}>
              <button
                onClick={() => setLogsOpen(!logsOpen)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-history w-5 text-center" />
                  <span className="font-medium">Logs & History</span>
                </div>
                <i
                  className={`fas fa-chevron-${logsOpen ? "up" : "down"} text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                />
              </button>

              {logsOpen && (
                <div className={`ml-4 mt-1 space-y-1 pl-3 border-l ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  {logItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => {
                        const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200";
                        if (isActive) {
                          return `${baseClasses} ${
                            isDarkMode
                              ? 'bg-indigo-600 text-white'
                              : 'bg-blue-50 text-blue-600'
                          }`;
                        }
                        return `${baseClasses} ${
                          isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        }`;
                      }}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                    >
                      <i className={`${item.icon} w-4 text-center text-xs`} />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </nav>

        {/* Logout */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className={`
              w-full flex items-center justify-center px-4 py-3
              rounded-lg font-medium transition-colors
              ${isDarkMode
                ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
              }
            `}
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;