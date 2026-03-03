import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import logo from "../../assets/images/logo.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        showToast("Account created successfully! Please login.", "success");
        navigate("/login");
      }
    } catch (error) {
      showToast(error.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex overflow-hidden">
      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        <div className="max-w-md w-full animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={logo}
              alt="Certificate Management Logo"
              className="mx-auto  w-16 h-16 md:w-20 md:h-20"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join our certificate management platform
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                icon="fas fa-user"
                error={errors.name}
                required
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                icon="fas fa-envelope"
                error={errors.email}
                required
                disabled={loading}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                icon="fas fa-lock"
                error={errors.password}
                required
                disabled={loading}
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    <i
                      className={`fas ${
                        showPassword ? "fa-eye-slash" : "fa-eye"
                      }`}
                    />
                  </button>
                }
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                icon="fas fa-lock"
                error={errors.confirmPassword}
                required
                disabled={loading}
              />

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 shadow-lg hover:shadow-xl transition-all"
                icon={loading ? null : "fas fa-user-plus"}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-2 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

        
        </div>
      </div>

      {/* Right side - Animation (WORKING) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full -translate-y-32 translate-x-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full translate-y-48 -translate-x-48 opacity-50"></div>

        <div className="relative z-10 max-w-lg w-full">
          <DotLottieReact
            src="https://lottie.host/cb55b136-d595-422f-a336-57521d6e9489/prxEdy0FPi.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "400px" }}
          />

          <div className="text-center space-y-4 mt-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Get Started Instantly
            </h2>
            <p className="text-gray-600 text-lg">
              Securely create and manage certificates in minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
