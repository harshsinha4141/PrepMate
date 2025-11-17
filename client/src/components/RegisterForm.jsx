import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "../api/axios";
import { toast } from 'react-toastify';
import {useNavigate} from "react-router-dom";
// Input must ONLY use props passed from RegisterForm
const Input = ({
  name,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  showPassword,
  setShowPassword,
}) => (
  <div className="relative mb-4">
    <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
    <input
      type={name === "password" && showPassword ? "text" : type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-10 pr-10 py-3 border rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-white"
    />
    {name === "password" && (
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3 top-3"
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5 text-gray-400" />
        ) : (
          <Eye className="w-5 h-5 text-gray-400" />
        )}
      </button>
    )}
    {error && <p className="text-red-500 text-sm pl-1">{error}</p>}
  </div>
);

const RegisterForm = ({ toggleMode }) => {
  const navigate=useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current.children,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear the error for this field (if any)
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name required";
    if (!formData.lastName) newErrors.lastName = "Last name required";
    if (!formData.email) newErrors.email = "Email required";
    if (!formData.password) newErrors.password = "Password required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/users/register", formData); 
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      toast.success(res.data?.message || 'Account created successfully');
      navigate("/home");
      // save token, redirect, and show toast
    } catch (err) {
      
      const message = err.response?.data?.message || err.message || 'Registration failed';
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
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
          <Input
            name="firstName"
            type="text"
            placeholder="First Name"
            icon={User}
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            
          />
          <Input
            name="lastName"
            type="text"
            placeholder="Last Name"
            icon={User}
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
          />
        </div>
        <Input
          name="email"
          type="email"
          placeholder="Email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
        c
          name="password"
          type="password"
          placeholder="Password"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={errors.password}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-medium flex items-center justify-center shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Create Account"}
        </button>
      </form>
      <div className="text-center mt-8">
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <button
            onClick={toggleMode}
            className="text-cyan-400 font-medium cursor-pointer hover:text-cyan-300 transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
