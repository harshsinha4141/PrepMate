import { useState, useRef, useEffect } from "react";
import { User, Coins, Star } from "lucide-react";
import { Link,useNavigate } from "react-router-dom";
import { useUserStats } from "../context/UserStatsContext";
import { toast } from "react-toastify";
import symbol from '../assets/symbol.png';
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [subMenu, setSubMenu] = useState(null); 
  const navigate=useNavigate();
  const dropdownRef = useRef(null);
   const { userStats, loading, refresh } = useUserStats();
  // Fetch user stats from backend
 
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSubMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully!");
    navigate("/");
  };

  // console.log("Navbar userStats:", userStats);
 return (
   <>
     <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-slate-800 border-b border-slate-700 shadow-lg px-6 py-3 flex items-center justify-between">
     <div className="flex gap-2">
       {/* Logo / Title */}
       <img
         className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-cyan-500/40 hover:scale-110 hover:rotate-3 transition-transform duration-300"
         src={symbol}
         alt="PrepMate Logo"
       />
       <span className="py-2 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
         PrepMate
       </span>
     </div>

     {/* Right Section */}
     <div className="flex items-center space-x-6">
       {/* Stats */}
       <div className="flex items-center space-x-4">
         {/* Coins */}
         <div className="flex items-center space-x-1 bg-cyan-900/30 border border-cyan-700/50 px-3 py-1.5 rounded-lg">
           <Coins className="w-5 h-5 text-cyan-400" />
           <span className="text-sm font-medium text-slate-200">
             {userStats?.coins ?? 0}
           </span>
         </div>
         {/* Rating */}
         <div className="flex items-center space-x-1 bg-orange-900/30 border border-orange-700/50 px-3 py-1.5 rounded-lg">
           <Star className="w-5 h-5 text-orange-400" />
           <span className="text-sm font-medium text-slate-200">
             {userStats?.averageRating ?? 0}
           </span>
         </div>
       </div>

       {/* Profile Dropdown */}
       <div className="relative" ref={dropdownRef}>
         <button
           onClick={() => {
             setOpen(!open);
             setSubMenu(null);
           }}
           className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:ring-2 hover:ring-cyan-500 transition-all"
         >
           <User className="w-6 h-6 text-slate-300" />
         </button>

         {open && (
           <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 text-slate-200 shadow-xl rounded-lg z-50">
             <ul className="py-2">
               {/* Profile */}
               <li className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors">
                 <Link
                   to="/profile"
                  
                 >
                   Profile
                 </Link>
               </li>

               {/* Interviewee */}
               <li className="px-4 py-2 hover:cyan-500 cursor-pointer">
                 <div
                   onClick={() =>
                     setSubMenu(
                       subMenu === "interviewee" ? null : "interviewee"
                     )
                   }
                   className="flex justify-between items-center text-slate-300 hover:text-slate-100"
                 >
                   <span>Interviewee</span>
                   <span className="text-cyan-400">▶</span>
                 </div>
                 {subMenu === "interviewee" && (
                   <ul className="mt-2 ml-2 bg-slate-900 border border-slate-700 rounded-lg shadow-inner">
                     <li className="hover:bg-slate-700 cursor-pointer">
                       <Link
                         to="/intervieweeprofile/upcoming"
                         className="block px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
                       >
                         Upcoming
                       </Link>
                     </li>
                     <li className="hover:bg-slate-700 cursor-pointer">
                       <Link
                         to="/intervieweeprofile/completed"
                         className="block px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
                       >
                         Completed
                       </Link>
                     </li>
                   </ul>
                 )}
               </li>

               {/* Interviewer */}
               <li className="px-4 py-2 hover:cyan-500 cursor-pointer">
                 <div
                   onClick={() =>
                     setSubMenu(
                       subMenu === "interviewer" ? null : "interviewer"
                     )
                   }
                   className="flex justify-between items-center text-slate-300 hover:text-slate-100"
                 >
                   <span>Interviewer</span>
                   <span className="text-cyan-400">▶</span>
                 </div>
                 {subMenu === "interviewer" && (
                   <ul className="mt-2 ml-2 bg-slate-900 border border-slate-700 rounded-lg shadow-inner">
                     <li>
                       <Link
                         to="/interviewerprofile/upcoming"
                         className="block px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                       >
                         Upcoming
                       </Link>
                     </li>
                     <li>
                       <Link
                         to="/interviewerprofile/completed"
                         className="block px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-700"
                       >
                         Completed
                       </Link>
                     </li>
                   </ul>
                 )}
               </li>
             </ul>
           </div>
         )}
       </div>
       <button
         onClick={handleLogout}
         className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all"
       >
         Logout
       </button>
     </div>
     </nav>
     {/* spacer to prevent content from being hidden behind fixed navbar */}
     <div className="h-16" aria-hidden="true" />
   </>
 );

};

export default Navbar;
