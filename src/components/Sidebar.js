import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Grid3x3,
  BookOpen,
  Trophy,
  Target,
  ClipboardList,
  FileText,
  Upload,
  ClipboardCheck,
  FileCheck,
  Calendar,
  Settings,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Logo from "./Logo";

export default function Sidebar({ user, onLogout }) {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width >= 1024) {
        setMobileOpen(false);
      }
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const toggleCollapse = () => {
    if (!isMobile) {
      setCollapsed(!collapsed);
    }
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get user initials (2 letters)
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

  // Format role label
  const getRoleLabel = (role) => {
    const roles = {
      admin: "Administrator",
      guru: "Guru",
      wali_kelas: "Wali Kelas",
      guru_kelas: "Guru Kelas",
    };
    return roles[role] || role;
  };

  // Get user name
  const userName = useMemo(
    () =>
      user?.full_name || user?.nama || user?.name || user?.username || "User",
    [user?.full_name, user?.nama, user?.name, user?.username]
  );

  // Check if route is active
  const isActive = (path) => location.pathname === path;

  // Check if parent menu has active child
  const hasActiveChild = (submenu) => {
    if (!submenu) return false;
    return submenu.some((item) => isActive(item.path));
  };

  // 🎯 MENU STRUKTUR SESUAI DATABASE SUPABASE
  const menuItems = [
    // DASHBOARD
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },

    // DATA MASTER
    {
      id: "data-master",
      label: "Data Master",
      icon: Users,
      hasSubmenu: true,
      submenu: [
        {
          id: "data-siswa",
          label: "Data Siswa",
          path: "/data-siswa",
          desc: "Table: students",
        },
        {
          id: "data-guru",
          label: "Data Guru",
          path: "/data-guru",
          adminOnly: true,
          desc: "Table: users (role guru)",
        },
        {
          id: "data-kelas",
          label: "Data Kelas",
          path: "/data-kelas",
          adminOnly: true,
          desc: "Table: classes",
        },
        {
          id: "mata-pelajaran",
          label: "Mata Pelajaran",
          path: "/mata-pelajaran",
          adminOnly: true,
          desc: "Table: subjects",
        },
        {
          id: "ekstrakurikuler",
          label: "Ekstrakurikuler",
          path: "/ekstrakurikuler",
          desc: "Table: extracurriculars",
        },
      ],
    },

    // PEMBELAJARAN
    {
      id: "pembelajaran",
      label: "Pembelajaran",
      icon: Target,
      hasSubmenu: true,
      submenu: [
        {
          id: "tujuan-pembelajaran",
          label: "Tujuan Pembelajaran",
          path: "/tujuan-pembelajaran",
          desc: "Table: learning_objectives",
        },
      ],
    },

    // PENILAIAN
    {
      id: "penilaian",
      label: "Penilaian",
      icon: ClipboardList,
      hasSubmenu: true,
      submenu: [
        {
          id: "input-nilai-mapel",
          label: "Input Nilai Mata Pelajaran",
          path: "/input-nilai-mapel",
          desc: "Table: student_scores",
        },
        {
          id: "capaian-tp",
          label: "Capaian Tujuan Pembelajaran",
          path: "/capaian-tp",
          desc: "Table: student_tp_achievements",
        },
        {
          id: "nilai-ekstrakurikuler",
          label: "Nilai Ekstrakurikuler",
          path: "/nilai-ekstrakurikuler",
          desc: "Table: student_extracurriculars",
        },
        {
          id: "data-ketidakhadiran",
          label: "Data Ketidakhadiran",
          path: "/data-ketidakhadiran",
          desc: "Table: attendances",
        },
      ],
    },

    // CEK PENILAIAN
    {
      id: "cek-penilaian",
      label: "Cek Penilaian",
      icon: ClipboardCheck,
      hasSubmenu: true,
      submenu: [
        {
          id: "status-nilai",
          label: "Status Nilai",
          path: "/status-nilai",
          desc: "Validasi kelengkapan nilai",
        },
        {
          id: "leger-nilai",
          label: "Leger Nilai",
          path: "/leger-nilai",
          desc: "Rekap nilai per kelas",
        },
      ],
    },

    // RAPOR
    {
      id: "rapor",
      label: "Rapor",
      icon: FileCheck,
      hasSubmenu: true,
      submenu: [
        {
          id: "cetak-rapor",
          label: "Cetak Rapor",
          path: "/cetak-rapor",
          desc: "Table: report_cards",
        },
        {
          id: "catatan-wali-kelas",
          label: "Catatan Wali Kelas",
          path: "/catatan-wali-kelas",
          desc: "Edit teacher_notes di report_cards",
        },
      ],
    },

    // PENGATURAN
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
      hasSubmenu: true,
      adminOnly: true,
      submenu: [
        {
          id: "profil-sekolah",
          label: "Profil Sekolah",
          path: "/profil-sekolah",
          desc: "Table: schools",
        },
        {
          id: "tahun-ajaran",
          label: "Tahun Ajaran",
          path: "/tahun-ajaran",
          desc: "Table: academic_years",
        },
      ],
    },
  ];

  // Filter menu berdasarkan role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false;
    }

    // Filter submenu juga
    if (item.submenu) {
      item.submenu = item.submenu.filter((subItem) => {
        if (subItem.adminOnly && user?.role !== "admin") {
          return false;
        }
        return true;
      });
    }

    return true;
  });

  const renderSidebarContent = () => (
    <>
      {/* Header Sidebar */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <Logo size="small" showFallback={true} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate">E-Raport SD</h1>
                <p className="text-xs text-blue-300 truncate">
                  {user?.schools?.name || "Sekolah"}
                </p>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex-shrink-0 hover:scale-110">
              <Menu size={18} className="text-slate-300" />
            </button>
          )}

          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all duration-300 flex-shrink-0 hover:scale-110">
              <X size={18} className="text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items - SCROLLABLE */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <style jsx>{`
          nav::-webkit-scrollbar {
            width: 6px;
          }
          nav::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5);
            border-radius: 10px;
          }
          nav::-webkit-scrollbar-thumb {
            background: rgba(71, 85, 105, 0.8);
            border-radius: 10px;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 1);
          }
        `}</style>

        <div className="space-y-1 px-2">
          {filteredMenuItems.map((item) => (
            <div key={item.id}>
              {/* Menu Item dengan routing */}
              {item.path ? (
                <Link
                  to={item.path}
                  onClick={() => isMobile && toggleMobileMenu()}
                  className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 overflow-hidden ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title={collapsed ? item.label : ""}>
                  {/* Active Indicator */}
                  {isActive(item.path) && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}

                  {/* Hover Background Effect */}
                  {!isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  )}

                  {/* Icon with glow on hover */}
                  <div
                    className={`relative z-10 flex-shrink-0 transition-all duration-300 ${
                      isActive(item.path)
                        ? "scale-110"
                        : "group-hover:scale-110"
                    }`}
                    style={{
                      filter: isActive(item.path)
                        ? "none"
                        : "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.filter =
                          "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.filter =
                          "drop-shadow(0 0 0px rgba(59, 130, 246, 0))";
                      }
                    }}>
                    <item.icon className="w-5 h-5" />
                  </div>

                  {!collapsed && (
                    <span className="relative z-10 text-sm font-medium truncate transition-all duration-300">
                      {item.label}
                    </span>
                  )}

                  {/* Shimmer effect on hover */}
                  {!isActive(item.path) && (
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  )}
                </Link>
              ) : (
                // Menu dengan submenu
                <>
                  <button
                    onClick={() => {
                      if (item.hasSubmenu) {
                        toggleMenu(item.id);
                      }
                    }}
                    className={`group relative w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-300 overflow-hidden ${
                      hasActiveChild(item.submenu)
                        ? "bg-slate-800/80 text-white"
                        : "text-slate-300 hover:text-white"
                    }`}
                    title={collapsed ? item.label : ""}>
                    {/* Hover Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      <div
                        className="flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          filter: "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter =
                            "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter =
                            "drop-shadow(0 0 0px rgba(59, 130, 246, 0))";
                        }}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      {!collapsed && (
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {item.hasSubmenu && !collapsed && (
                      <div className="relative z-10 text-slate-400 flex-shrink-0 transition-transform duration-300">
                        {expandedMenus[item.id] ? (
                          <ChevronDown className="w-4 h-4 group-hover:text-blue-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 group-hover:text-blue-400" />
                        )}
                      </div>
                    )}

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </button>

                  {/* Submenu */}
                  {item.hasSubmenu && expandedMenus[item.id] && !collapsed && (
                    <div className="mt-1 space-y-1 ml-4 border-l-2 border-slate-700/50">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          onClick={() => isMobile && toggleMobileMenu()}
                          className={`group relative w-full flex items-center gap-3 px-3 py-2.5 pl-6 rounded-lg text-sm transition-all duration-300 overflow-hidden ${
                            isActive(subItem.path)
                              ? "bg-blue-600/20 text-blue-400 font-medium"
                              : "text-slate-400 hover:text-white"
                          }`}>
                          {/* Hover Background */}
                          <div className="absolute inset-0 bg-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                          {/* Dot Indicator */}
                          <div
                            className={`absolute left-2 w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              isActive(subItem.path)
                                ? "bg-blue-400"
                                : "bg-slate-600 group-hover:bg-blue-400"
                            }`}
                          />

                          <span className="relative z-10 truncate">
                            {subItem.label}
                          </span>

                          {/* Shimmer */}
                          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer User Info */}
      <div className="flex-shrink-0 p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-blue-500/30 transition-transform duration-300 hover:scale-110 hover:ring-blue-400/50">
            <span className="text-sm font-bold">{getInitials(userName)}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-blue-300 truncate">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Mobile & Tablet: Overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-all duration-300 hover:scale-110">
          <Menu size={24} />
        </button>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Sidebar Overlay */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white border-r border-slate-700/50 z-50 lg:hidden transform transition-transform duration-300 flex flex-col shadow-2xl ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          {renderSidebarContent()}
        </div>
      </>
    );
  }

  // Desktop: Fixed sidebar with internal scroll
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen bg-slate-900 text-white border-r border-slate-700/50 transition-all duration-300 flex flex-col shadow-2xl z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}>
        {renderSidebarContent()}
      </div>

      {/* Spacer untuk push konten ke kanan */}
      <div
        className={`transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
      />
    </>
  );
}
