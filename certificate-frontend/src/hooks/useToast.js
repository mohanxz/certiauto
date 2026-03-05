// src/hooks/useToast.js
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';

export const useToast = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Listen for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDarkMode(dark);
    };

    // Initial check
    checkDarkMode();

    // Watch for class changes on documentElement
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Get toast theme based on dark mode
  const getToastTheme = () => {
    return {
      theme: isDarkMode ? "dark" : "light",
      className: isDarkMode ? 'dark-toast' : '',
      progressClassName: isDarkMode ? 'dark-progress' : '',
    };
  };

  const showToast = (message, type = "info", customOptions = {}) => {
    const baseOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...getToastTheme(),
    };

    const options = { ...baseOptions, ...customOptions };

    switch (type) {
      case "success":
        toast.success(message, options);
        // Trigger confetti for major successes
        if (message.includes("Campaign") || 
            message.includes("created") || 
            message.includes("updated") || 
            message.includes("sent to") || 
            message.includes("downloaded")) {
          setTimeout(() => {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
            });
          }, 100);
        }
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warning(message, options);
        break;
      case "info":
        toast.info(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  const showSuccessWithConfetti = (message, customColors = null) => {
    const options = {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...getToastTheme(),
    };

    toast.success(message, options);
    
    // Celebration confetti with more particles
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: customColors || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    });
    
    // Add a second small burst for effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: customColors || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: customColors || ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
      });
    }, 150);
  };

  const showCelebration = (message) => {
    const options = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      icon: '🎉',
      ...getToastTheme(),
    };

    toast.success(message, options);
    
    // Full celebration mode with continuous confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
      
      // since particles fall down, start a bit higher than random
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors
      });
    }, 250);
  };

  // Add custom styles for dark mode toasts (only once)
  useEffect(() => {
    const styleId = 'toast-dark-mode-styles';
    
    // Check if styles already exist
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .dark-toast {
          background-color: #1F2937 !important;
          color: #F3F4F6 !important;
          border: 1px solid #374151 !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
        }
        
        .dark-progress {
          background: linear-gradient(to right, #3B82F6, #8B5CF6) !important;
        }
        
        .Toastify__toast--success.dark-toast {
          border-left: 4px solid #10B981 !important;
        }
        
        .Toastify__toast--error.dark-toast {
          border-left: 4px solid #EF4444 !important;
        }
        
        .Toastify__toast--warning.dark-toast {
          border-left: 4px solid #F59E0B !important;
        }
        
        .Toastify__toast--info.dark-toast {
          border-left: 4px solid #3B82F6 !important;
        }
        
        .dark-toast .Toastify__close-button {
          color: #9CA3AF !important;
          opacity: 0.8;
        }
        
        .dark-toast .Toastify__close-button:hover {
          color: #F3F4F6 !important;
          opacity: 1;
        }
        
        .dark-toast .Toastify__progress-bar {
          background: rgba(255, 255, 255, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Clean up styles on unmount (optional)
      // const style = document.getElementById(styleId);
      // if (style) style.remove();
    };
  }, []);

  return { 
    showToast, 
    showSuccessWithConfetti,
    showCelebration 
  };
};