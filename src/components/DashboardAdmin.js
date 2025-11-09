// src/components/DashboardAdmin.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Users, Building2, GraduationCap, FileText } from "lucide-react";

function DashboardAdmin({ user, session }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    activeYear: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🎯 DashboardAdmin mounted with user:", user);
    if (user?.school_id) {
      fetchDashboardStats();
    } else {
      console.warn("⚠️ No school_id found in user data");
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get active academic year
      const { data: yearData, error: yearError } = await supabase
        .from("academic_years")
        .select("*")
        .eq("school_id", user.school_id)
        .eq("is_active", true)
        .maybeSingle();

      if (yearError) console.log("Year query error:", yearError);

      // Get total students
      const { count: studentsCount } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.school_id)
        .eq("is_active", true);

      // Get total classes
      const { count: classesCount } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.school_id);

      // Get total teachers
      const { count: teachersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("school_id", user.school_id)
        .eq("is_active", true);

      setStats({
        totalStudents: studentsCount || 0,
        totalClasses: classesCount || 0,
        totalTeachers: teachersCount || 0,
        activeYear: yearData,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const userName = user?.full_name || user?.nama || user?.username || "Admin";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-slate-800">
          Selamat Datang, {userName}! 👋
        </h2>
        <p className="text-slate-600">
          {stats.activeYear
            ? `Tahun Ajaran: ${stats.activeYear.name}`
            : "Belum ada tahun ajaran aktif"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Siswa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Siswa
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="bg-indigo-100 rounded-full p-3">
                  <Users className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
            </div>

            {/* Total Kelas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Kelas
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalClasses}
                  </p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Building2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Guru */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Guru
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalTeachers}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <GraduationCap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Menu Admin</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Siswa */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <Users className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Data Siswa
                </span>
              </button>

              {/* Kelas */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all">
                <Building2 className="w-10 h-10 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Data Kelas
                </span>
              </button>

              {/* Nilai */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <FileText className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Input Nilai
                </span>
              </button>

              {/* Rapor */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
                <FileText className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Cetak Rapor
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardAdmin;
