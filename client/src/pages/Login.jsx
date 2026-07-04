import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const Login = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRedirectPath = (role) => {
    switch (role) {
      case "rep":
        return "/sales";
      default:
        return "/dashboard";
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (token && user) {
      navigate(getRedirectPath(user.role), { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate(getRedirectPath(result.user.role), { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-white">
      {/* Left side: Premium gradient banner with floating 3D icons */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#e8efff] to-[#ebe1fb] p-12 relative overflow-hidden select-none">
        
        {/* Subtle decorative mesh or ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-400/10 blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="max-w-md text-center z-10 flex flex-col items-center">
          <h1 className="text-5xl font-black text-[#3b66f5] tracking-tight mb-6">
            Thejani Traders
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-sm">
            Efficiently manage your warehouse operations with our next-gen platform.
          </p>

          {/* Floating 3D Cards */}
          <div className="flex gap-6 mt-2 justify-center items-center">
            {/* Card 1: Cardboard Box */}
            <div className="bg-white p-4 rounded-[24px] shadow-[0_16px_36px_rgba(0,0,0,0.05)] w-24 h-24 flex items-center justify-center -rotate-6 hover:-rotate-12 transition-transform duration-300">
              <img 
                src="/box_icon.png" 
                alt="Box Icon" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {/* Card 2: Bar Chart */}
            <div className="bg-white p-4 rounded-[24px] shadow-[0_16px_36px_rgba(0,0,0,0.05)] w-24 h-24 flex items-center justify-center rotate-6 hover:rotate-12 transition-transform duration-300">
              <img 
                src="/chart_icon.png" 
                alt="Chart Icon" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Clean white layout containing the form */}
      <div className="flex items-center justify-center p-8 md:p-12 lg:p-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 font-medium">
              Please sign in to your account
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-[#3b66f5] hover:text-blue-700 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-blue-500 text-gray-900 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2463eb] hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-8 text-[15px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer links */}
          <p className="text-sm text-gray-500 text-center mt-12 font-medium">
            Don't have an account?{" "}
            <a
              href="#"
              className="font-bold text-[#3b66f5] hover:text-blue-700 hover:underline transition-all"
              onClick={(e) => e.preventDefault()}
            >
              Contact Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
