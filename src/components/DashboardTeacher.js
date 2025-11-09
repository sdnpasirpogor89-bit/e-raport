// src/components/DashboardTeacher.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { BookOpen, ClipboardList, Target, Calendar } from "lucide-react";

function DashboardTeacher({ user, session }) {
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalClasses: 0,
    activeYear: null,
  });
  const [mySubjects, setMySubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🎯 DashboardTeacher mounted with user:", user);
    if (user?.id && user?.school_id) {
      fetchTeacherData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      // Get active academic year
      const { data: yearData } = await supabase
        .from("academic_years")
        .select("*")
        .eq("school_id", user.school_id)
        .eq("is_active", true)
        .maybeSingle();

      // Get subjects taught by this teacher
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("teacher_subjects")
        .select(
          `
          *,
          subjects (name, code),
          classes (name, grade)
        `
        )
        .eq("teacher_id", user.id);

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
      }

      // Count unique subjects and classes
      const uniqueSubjects = new Set(
        subjectsData?.map((s) => s.subject_id) || []
      );
      const uniqueClasses = new Set(subjectsData?.map((s) => s.class_id) || []);

      setStats({
        totalSubjects: uniqueSubjects.size,
        totalClasses: uniqueClasses.size,
        activeYear: yearData,
      });

      setMySubjects(subjectsData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setLoading(false);
    }
  };

  const userName = user?.name || user?.full_name || user?.username || "Guru";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-slate-800">
          Selamat Datang, {userName} ! 👋
        </h2>
        <p className="text-slate-600">
          {stats.activeYear
            ? `Tahun Ajaran: ${stats.activeYear.name}`
            : "Belum ada tahun ajaran aktif"}
        </p>
        <p className="text-sm text-slate-500 mt-1">Guru Mata Pelajaran</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Mata Pelajaran */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Mata Pelajaran
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats.totalSubjects}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Diampu saat ini</p>
                </div>
                <div className="bg-emerald-100 rounded-full p-3">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
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
                  <p className="text-3xl font-bold text-teal-600">
                    {stats.totalClasses}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Yang diajar</p>
                </div>
                <div className="bg-teal-100 rounded-full p-3">
                  <Target className="w-8 h-8 text-teal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Mata Pelajaran yang Diampu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Mata Pelajaran yang Diampu
            </h3>

            {mySubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySubjects.map((item, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {item.subjects?.name || "Mata Pelajaran"}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Kelas: {item.classes?.name || "-"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Kode: {item.subjects?.code || "-"}
                        </p>
                      </div>
                      <div className="bg-emerald-100 rounded-lg px-3 py-1">
                        <span className="text-xs font-semibold text-emerald-700">
                          Grade {item.classes?.grade || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Belum ada mata pelajaran yang diampu</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Menu Guru</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Input Nilai */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                <ClipboardList className="w-10 h-10 text-emerald-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Input Nilai
                </span>
              </button>

              {/* Tujuan Pembelajaran */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all">
                <Target className="w-10 h-10 text-teal-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Tujuan Pembelajaran
                </span>
              </button>

              {/* Nilai Tersimpan */}
              <button className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <Calendar className="w-10 h-10 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">
                  Nilai Tersimpan
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardTeacher;
