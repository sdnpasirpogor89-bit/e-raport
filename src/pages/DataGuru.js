// src/pages/DataGuru.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  GraduationCap,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  BookOpen,
  Save,
  Download,
  Users,
  School,
  UserCheck,
} from "lucide-react";
import ExcelJS from "exceljs";

// Stats Card Component
const StatsCard = ({ icon: Icon, number, label, color }) => {
  const colorClasses = {
    blue: "border-l-blue-500 bg-gradient-to-r from-blue-50 to-white",
    purple: "border-l-purple-500 bg-gradient-to-r from-purple-50 to-white",
    emerald: "border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-white",
  };

  const iconColorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    emerald: "text-emerald-600",
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClasses[color]} p-4 hover:shadow-md transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{number}</p>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
        <Icon size={28} className={iconColorClasses[color]} />
      </div>
    </div>
  );
};

function DataGuru({ user }) {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    nip: "",
    phone: "",
    role: "guru",
  });
  const [assignData, setAssignData] = useState({
    teacher_id: "",
    subject_id: "",
    class_id: "",
  });
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waliKelas: 0,
    guruMapel: 0,
  });

  // Fetch teachers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch teachers
        const { data: teachersData, error: teachersError } = await supabase
          .from("users")
          .select("*")
          .eq("school_id", user.school_id)
          .in("role", ["guru", "wali_kelas", "guru_kelas"])
          .eq("is_active", true);

        if (teachersError) throw teachersError;

        // Fetch classes untuk dapat info wali kelas pegang kelas apa
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("id, name, grade, wali_kelas_id")
          .eq("school_id", user.school_id);

        if (classesError) throw classesError;

        // Map teachers dengan info kelasnya
        const teachersWithClass = (teachersData || []).map((teacher) => {
          // Cari kelas yang dia pegang
          const teacherClass = classesData?.find(
            (cls) => cls.wali_kelas_id === teacher.id
          );

          return {
            ...teacher,
            assigned_class: teacherClass || null,
          };
        });

        // Sorting: Wali Kelas by grade, then Guru Mapel
        const sorted = teachersWithClass.sort((a, b) => {
          const aIsWali = a.role === "wali_kelas" || a.role === "guru_kelas";
          const bIsWali = b.role === "wali_kelas" || b.role === "guru_kelas";

          if (aIsWali && !bIsWali) return -1;
          if (!aIsWali && bIsWali) return 1;

          if (aIsWali && bIsWali) {
            const aGrade = a.assigned_class?.grade || 999;
            const bGrade = b.assigned_class?.grade || 999;
            return aGrade - bGrade;
          }

          return (a.name || "").localeCompare(b.name || "");
        });

        setTeachers(sorted);
        setFilteredTeachers(sorted);

        // Update stats
        const waliKelas = sorted.filter(
          (t) => t.role === "wali_kelas" || t.role === "guru_kelas"
        );
        const guruMapel = sorted.filter((t) => t.role === "guru");
        setStats({
          total: sorted.length,
          waliKelas: waliKelas.length,
          guruMapel: guruMapel.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Gagal memuat data guru: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchSubjects();
    fetchClasses();
  }, [user.school_id]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("school_id", user.school_id)
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .order("name");

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchTeacherSubjects = async (teacherId) => {
    try {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select(
          `
          *,
          subjects (name, code),
          classes (name, grade)
        `
        )
        .eq("teacher_id", teacherId);

      if (error) throw error;
      setTeacherSubjects(data || []);
    } catch (error) {
      console.error("Error fetching teacher subjects:", error);
    }
  };

  // Search filter
  useEffect(() => {
    const filtered = teachers.filter((teacher) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        teacher.name?.toLowerCase().includes(searchLower) ||
        teacher.username?.toLowerCase().includes(searchLower) ||
        teacher.nip?.toLowerCase().includes(searchLower) ||
        teacher.assigned_class?.name?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedTeacher(null);
    setFormData({
      username: "",
      password: "",
      name: "",
      nip: "",
      phone: "",
      role: "guru",
    });
    setShowModal(true);
  };

  const openEditModal = (teacher) => {
    setModalMode("edit");
    setSelectedTeacher(teacher);
    setFormData({
      username: teacher.username || "",
      password: "",
      name: teacher.name || "",
      nip: teacher.nip || "",
      phone: teacher.phone || "",
      role: teacher.role || "guru",
    });
    setShowModal(true);
  };

  const openAssignModal = async (teacher) => {
    setSelectedTeacher(teacher);
    setAssignData({
      teacher_id: teacher.id,
      subject_id: "",
      class_id: "",
    });
    await fetchTeacherSubjects(teacher.id);
    setShowAssignModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === "add") {
        const userData = {
          school_id: user.school_id,
          username: formData.username,
          password_hash: formData.password,
          name: formData.name,
          nip: formData.nip,
          phone: formData.phone,
          role: formData.role,
          is_active: true,
        };

        const { error } = await supabase.from("users").insert([userData]);
        if (error) throw error;
        alert("Guru berhasil ditambahkan!");
      } else {
        const updateData = {
          username: formData.username,
          name: formData.name,
          nip: formData.nip,
          phone: formData.phone,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password_hash = formData.password;
        }

        const { error } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", selectedTeacher.id);

        if (error) throw error;
        alert("Data guru berhasil diupdate!");
      }

      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error saving teacher:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Yakin ingin menghapus guru ini?")) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", teacherId);

      if (error) throw error;
      alert("Guru berhasil dihapus!");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Error: " + error.message);
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("teacher_subjects").insert([
        {
          teacher_id: assignData.teacher_id,
          subject_id: assignData.subject_id,
          class_id: assignData.class_id,
          school_id: user.school_id,
        },
      ]);

      if (error) throw error;
      alert("Mata pelajaran berhasil ditambahkan!");
      setAssignData({
        ...assignData,
        subject_id: "",
        class_id: "",
      });
      fetchTeacherSubjects(assignData.teacher_id);
    } catch (error) {
      console.error("Error assigning subject:", error);
      alert("Error: " + error.message);
    }
  };

  const handleRemoveSubject = async (assignmentId) => {
    if (!window.confirm("Yakin ingin menghapus assignment ini?")) return;

    try {
      const { error } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
      alert("Assignment berhasil dihapus!");
      fetchTeacherSubjects(assignData.teacher_id);
    } catch (error) {
      console.error("Error removing subject:", error);
      alert("Error: " + error.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Guru");

      worksheet.columns = [
        { header: "No", key: "no", width: 5 },
        { header: "Nama", key: "nama", width: 25 },
        { header: "No. Telepon", key: "phone", width: 15 },
        { header: "Penugasan", key: "penugasan", width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      filteredTeachers.forEach((teacher, index) => {
        const penugasan = getPenugasanLabel(teacher);

        worksheet.addRow({
          no: index + 1,
          nama: teacher.name,
          phone: teacher.phone || "-",
          penugasan: penugasan,
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Data_Guru_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Gagal export data");
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      guru: "Guru Mapel",
      wali_kelas: "Wali Kelas",
      guru_kelas: "Guru Kelas",
    };
    return roles[role] || role;
  };

  const getPenugasanLabel = (teacher) => {
    if (teacher.role === "wali_kelas" || teacher.role === "guru_kelas") {
      if (teacher.assigned_class) {
        return `Wali Kelas ${teacher.assigned_class.grade}`;
      }
      return "Wali Kelas";
    }
    return "Guru Mapel";
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data guru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Data Guru
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola data guru dan assignment mata pelajaran
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={Users}
          number={stats.total}
          label="Total Guru"
          color="blue"
        />
        <StatsCard
          icon={School}
          number={stats.waliKelas}
          label="Wali Kelas"
          color="purple"
        />
        <StatsCard
          icon={UserCheck}
          number={stats.guruMapel}
          label="Guru Mapel"
          color="emerald"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari nama atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Daftar Guru</h2>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan {filteredTeachers.length} dari {teachers.length} guru
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider w-16">
                  No
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Penugasan
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {teacher.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                          teacher.role === "wali_kelas" ||
                          teacher.role === "guru_kelas"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                        {getPenugasanLabel(teacher)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAssignModal(teacher)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Assign Mata Pelajaran">
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <GraduationCap size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        Tidak ada data guru yang cocok
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Guru" : "Edit Guru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIP
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) =>
                      setFormData({ ...formData, nip: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *{" "}
                    {modalMode === "edit" && "(kosongkan jika tidak diubah)"}
                  </label>
                  <input
                    type="password"
                    required={modalMode === "add"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="guru">Guru Mapel</option>
                    <option value="wali_kelas">Wali Kelas</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  {modalMode === "add" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Assign */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Assign Mata Pelajaran - {selectedTeacher?.name}
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Assign */}
              <form onSubmit={handleAssignSubject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran *
                    </label>
                    <select
                      required
                      value={assignData.subject_id}
                      onChange={(e) =>
                        setAssignData({
                          ...assignData,
                          subject_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="">Pilih Mapel</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kelas *
                    </label>
                    <select
                      required
                      value={assignData.class_id}
                      onChange={(e) =>
                        setAssignData({
                          ...assignData,
                          class_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="">Pilih Kelas</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Save className="w-4 h-4" />
                      Tambah
                    </button>
                  </div>
                </div>
              </form>

              {/* List Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Mata Pelajaran yang Diampu
                </h3>
                {teacherSubjects.length > 0 ? (
                  <div className="space-y-2">
                    {teacherSubjects.map((ts) => (
                      <div
                        key={ts.id}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">
                            {ts.subjects?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Kelas: {ts.classes?.name} | Kode:{" "}
                            {ts.subjects?.code}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveSubject(ts.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataGuru;
