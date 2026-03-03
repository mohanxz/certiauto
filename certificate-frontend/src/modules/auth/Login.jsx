import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import logo from "../../assets/images/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginAttempts >= 5) {
      showToast("Too many failed attempts. Please try again later.", "error");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Clear login attempts on success
        setLoginAttempts(0);

        showToast("Login successful! Redirecting...", "success");

        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        setLoginAttempts((prev) => prev + 1);
        showToast(result.message || "Invalid credentials", "error");
      }
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);
      showToast(
        error.response?.data?.message || "Connection error. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit(e);
    }
  };

  const remainingAttempts = 5 - loginAttempts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex overflow-hidden">
      {/* Left side - Graphics & Info (previously right side) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full translate-y-48 -translate-x-48 opacity-50"></div>

        <div className="relative z-10 max-w-lg w-full">
          <div className="mb-8">
            <DotLottieReact
              src="https://lottie.host/cb55b136-d595-422f-a336-57521d6e9489/prxEdy0FPi.lottie"
              loop
              autoplay
              style={{ width: "100%", height: "400px" }}
            />
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Enterprise-Grade Certificate Management
            </h2>
            <p className="text-gray-600 text-lg">
              Secure, scalable, and compliant certificate lifecycle management
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form (previously left side) */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="max-w-md w-full animate-fade-in">
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Certificate Management Logo"
              className="mx-auto mb-4 w-16 h-16 md:w-20 md:h-20"
            />

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>

            <p className="text-gray-600 text-sm md:text-base">
              Sign in to your certificate management dashboard
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 transform transition-all hover:shadow-2xl">
            {loginAttempts >= 3 && remainingAttempts > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mr-3"></i>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Multiple failed attempts</p>
                    <p className="mt-1">
                      {remainingAttempts} attempt
                      {remainingAttempts !== 1 ? "s" : ""} remaining before
                      temporary lockout
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                onKeyPress={handleKeyPress}
                placeholder="name@company.com"
                required
                icon="fas fa-envelope"
                error={errors.email}
                disabled={loading}
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"} // Hidden by default
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                required
                icon="fas fa-lock"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-gray-500 hover:text-blue-600 focus:outline-none"
                  >
                    <i
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    ></i>
                  </button>
                }
                error={errors.password}
                disabled={loading}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    disabled={loading}
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Remember this device
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                loading={loading}
                disabled={loading || loginAttempts >= 5}
                icon={loading ? null : "fas fa-sign-in-alt"}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile view toggle for animation */}
      <button
        className="lg:hidden fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-50"
        onClick={() =>
          document
            .querySelector(".hidden.lg\\:flex")
            .classList.toggle("mobile-show")
        }
      >
        <i className="fas fa-eye"></i>
      </button>
    </div>
  );
};

export default Login;
