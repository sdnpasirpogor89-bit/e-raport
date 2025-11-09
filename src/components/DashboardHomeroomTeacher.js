// src/components/DashboardHomeroomTeacher.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Users,
  ClipboardCheck,
  FileText,
  Target,
  BookOpen,
  Info,
} from "lucide-react";

function DashboardHomeroomTeacher({ user, session }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    myClass: null,
    activeYear: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🎯 DashboardHomeroomTeacher mounted with user:", user);
    if (user?.id && user?.school_id) {
      fetchHomeroomData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchHomeroomData = async () => {
    try {
      setLoading(true);

      // Get active academic year
      const { data: yearData } = await supabase
        .from("academic_years")
        .select("*")
        .eq("school_id", user.school_id)
        .eq("is_active", true)
        .maybeSingle();

      // Get class that this teacher is homeroom for
      const { data: classData } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .eq("wali_kelas_id", user.id)
        .maybeSingle();

      // Get student count in this class
      let studentCount = 0;
      if (classData) {
        const { count } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("class_id", classData.id)
          .eq("is_active", true);

        studentCount = count || 0;
      }

      setStats({
        totalStudents: studentCount,
        myClass: classData,
        activeYear: yearData,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching homeroom data:", error);
      setLoading(false);
    }
  };

  const userName =
    user?.name || user?.full_name || user?.username || "Wali Kelas";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-1xl lg:text-1xl font-bold mb-2 text-slate-800">
          SELAMAT DATANG, {userName} ! 👋
        </h2>
        <p className="text-slate-600">
          {stats.activeYear
            ? `Tahun Ajaran: ${stats.activeYear.name}`
            : "Belum ada tahun ajaran aktif"}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Wali Kelas {stats.myClass ? `- ${stats.myClass.name}` : ""}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kelas Saya */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Kelas Saya
                  </p>
                  <p className="text-2xl font-bold text-violet-600">
                    {stats.myClass?.name || "Belum Ada"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.myClass
                      ? `Tingkat ${stats.myClass.grade}`
                      : "Belum ditugaskan"}
                  </p>
                </div>
                <div className="bg-violet-100 rounded-full p-3">
                  <BookOpen className="w-8 h-8 text-violet-600" />
                </div>
              </div>
            </div>

            {/* Total Siswa */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Siswa
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Siswa aktif</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Menu Wali Kelas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Data Siswa */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Users className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Data Siswa
                </span>
              </button>

              {/* Cek Penilaian */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-all">
                <ClipboardCheck className="w-10 h-10 text-violet-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Cek Penilaian
                </span>
              </button>

              {/* Cetak Rapor */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
                <FileText className="w-10 h-10 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Cetak Rapor
                </span>
              </button>

              {/* Tujuan Pembelajaran */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                <Target className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Tujuan Pembelajaran
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardHomeroomTeacher;
