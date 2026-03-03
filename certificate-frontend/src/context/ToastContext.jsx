import React, { createContext, useContext } from 'react';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = "info", options = {}) => {
    const defaultOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case "success":
        toast.success(message, defaultOptions);
        // Trigger confetti for major successes
        if (message.includes("Campaign") || message.includes("sent to") || message.includes("downloaded")) {
          setTimeout(() => {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 100);
        }
        break;
      case "error":
        toast.error(message, defaultOptions);
        break;
      case "warning":
        toast.warning(message, defaultOptions);
        break;
      case "info":
        toast.info(message, defaultOptions);
        break;
      default:
        toast(message, defaultOptions);
    }
  };

  const showSuccessWithConfetti = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const value = {
    showToast,
    showSuccessWithConfetti
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};