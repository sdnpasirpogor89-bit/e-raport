// src/components/Layout.jsx
import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, LogOut, GraduationCap } from "lucide-react";
import Sidebar from "./Sidebar";

function Layout({ user, onLogout, children }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const timerRef = useRef(null);

  const userName =
    user?.full_name || user?.nama || user?.name || user?.username || "User";
  const schoolName = user?.schools?.name || "SDN 1 PASIRPOGOR";

  // Get user initials (2 letters) - sama seperti di Sidebar
  const getInitials = (name) => {
    if (!name) return "US";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: "Administrator",
      guru: "Guru",
      wali_kelas: "Wali Kelas",
      guru_kelas: "Guru Kelas",
    };
    return roles[role] || role;
  };

  // Device detection
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDeviceType();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  // Clock update
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    const interval = isMobile ? 5000 : 1000;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(updateTime, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isMobile]);

  // Format date
  const formatDate = (date) => {
    if (isMobile) {
      const day = date.toLocaleDateString("id-ID", { weekday: "short" });
      const dateStr = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      return `${day}, ${dateStr}/${month}`;
    } else {
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: isMobile ? undefined : "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Clean Simple Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4 gap-4">
              {/* Left - Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-slate-900">
                    E-Raport SD
                  </h1>
                  <p className="text-xs text-slate-600">{schoolName}</p>
                </div>
              </div>

              {/* Right - Info */}
              <div className="flex items-center gap-3 lg:gap-4">
                {/* Clock & Date - Simple */}
                <div className="flex items-center gap-3 text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-mono font-semibold text-sm">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                  <div className="hidden md:block w-px h-6 bg-slate-300"></div>
                  <div className="hidden md:flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm font-medium">
                      {formatDate(currentTime)}
                    </span>
                  </div>
                </div>

                {/* User Info - Simple */}
                <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {getInitials(userName)}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm">
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
