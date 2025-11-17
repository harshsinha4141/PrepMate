import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
const LoginForm = ({ toggleMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate=useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(formRef.current.children, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/users/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      toast.success(res.data?.message || 'Signed in successfully');
      navigate("/home");
      // save token, redirect, and show toast
    } catch (err) {
      
      const message = err.response?.data?.message || err.message || 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12">
      <div className="flex items-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mr-3 shadow-lg shadow-cyan-500/50">
          <User className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          PrepMate
        </h1>
      </div>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full pl-10 pr-4 py-3 border rounded-xl bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          {errors.email && (
            <p className="text-red-400 text-sm pl-1 mt-1">{errors.email}</p>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-3 border rounded-xl bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
          {errors.password && (
            <p className="text-red-400 text-sm pl-1 mt-1">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? "Processing..." : "Sign In"}
        </button>
      </form>
      <div className="text-center mt-8">
        <p className="text-sm text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={toggleMode}
            className="text-cyan-400 font-medium cursor-pointer hover:text-cyan-300 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
