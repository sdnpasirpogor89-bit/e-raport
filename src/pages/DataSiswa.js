// src/components/DataSiswa.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Users, Search, Plus, Edit2, Trash2, X, Filter } from "lucide-react";

function DataSiswa({ user }) {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [myClassId, setMyClassId] = useState(null); // For homeroom teacher
  const [formData, setFormData] = useState({
    name: "",
    nis: "",
    nisn: "",
    class_id: "",
    gender: "",
    birth_place: "",
    birth_date: "",
    address: "",
    parent_name: "",
    parent_phone: "",
  });

  // Check user roles
  const isAdmin = user?.role === "admin";
  const isHomeroomTeacher = user?.role === "wali_kelas";
  const isTeacher = user?.role === "guru";

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      fetchStudents();
    }
  }, [selectedClass, classes, myClassId]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", user.school_id)
        .order("grade", { ascending: true });

      if (error) throw error;
      setClasses(data || []);

      // If homeroom teacher, get their class
      if (isHomeroomTeacher) {
        const myClass = data?.find((cls) => cls.wali_kelas_id === user.id);
        if (myClass) {
          setMyClassId(myClass.id);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("students")
        .select(
          `
          *,
          classes (id, name, grade)
        `
        )
        .eq("school_id", user.school_id)
        .order("name", { ascending: true });

      // If homeroom teacher, only show their class students
      if (isHomeroomTeacher && myClassId) {
        query = query.eq("class_id", myClassId);
      } else if (selectedClass) {
        // Admin or Teacher can filter by class
        query = query.eq("class_id", selectedClass);
      }

      const { data, error } = await query;

      if (error) throw error;
      setStudents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.nis?.toLowerCase().includes(searchLower) ||
      student.nisn?.toLowerCase().includes(searchLower)
    );
  });

  const openAddModal = () => {
    setModalMode("add");
    setSelectedStudent(null);
    setFormData({
      name: "",
      nis: "",
      nisn: "",
      class_id: "",
      gender: "",
      birth_place: "",
      birth_date: "",
      address: "",
      parent_name: "",
      parent_phone: "",
    });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setModalMode("edit");
    setSelectedStudent(student);
    setFormData({
      name: student.name || "",
      nis: student.nis || "",
      nisn: student.nisn || "",
      class_id: student.class_id || "",
      gender: student.gender || "",
      birth_place: student.birth_place || "",
      birth_date: student.birth_date || "",
      address: student.address || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const studentData = {
        ...formData,
        school_id: user.school_id,
        is_active: true,
      };

      if (modalMode === "add") {
        const { error } = await supabase.from("students").insert([studentData]);
        if (error) throw error;
        alert("Siswa berhasil ditambahkan!");
      } else {
        const { error } = await supabase
          .from("students")
          .update(studentData)
          .eq("id", selectedStudent.id);
        if (error) throw error;
        alert("Data siswa berhasil diupdate!");
      }

      setShowModal(false);
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Yakin ingin menghapus siswa ini?")) return;

    try {
      const { error } = await supabase
        .from("students")
        .update({ is_active: false })
        .eq("id", studentId);

      if (error) throw error;
      alert("Siswa berhasil dihapus!");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Error: " + error.message);
    }
  };

  // Check if user can delete students
  const canDelete = isAdmin || isHomeroomTeacher;

  // Check if user can add students
  const canAdd = isAdmin;

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const maleStudents = filteredStudents.filter((s) => s.gender === "L").length;
  const femaleStudents = filteredStudents.filter(
    (s) => s.gender === "P"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Data Siswa
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isHomeroomTeacher
              ? "Kelola data siswa di kelas Anda"
              : isTeacher
              ? "Lihat data siswa sekolah"
              : "Kelola data siswa sekolah"}
          </p>
        </div>
        <div className="flex gap-2">
          {canAdd && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Siswa</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalStudents}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Laki-laki</p>
              <p className="text-3xl font-bold text-gray-900">{maleStudents}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Perempuan</p>
              <p className="text-3xl font-bold text-gray-900">
                {femaleStudents}
              </p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama, NIS, atau NISN..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Class - Not shown for homeroom teacher */}
          {!isHomeroomTeacher && (
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white">
                <option value="">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.nisn || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.gender === "L"
                          ? "Laki-laki"
                          : student.gender === "P"
                          ? "Perempuan"
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          {student.classes?.name || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {student.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Belum ada data siswa</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Tambah Siswa" : "Edit Siswa"}
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
                    NIS
                  </label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NISN
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) =>
                      setFormData({ ...formData, nisn: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas *
                  </label>
                  <select
                    required
                    value={formData.class_id}
                    onChange={(e) =>
                      setFormData({ ...formData, class_id: e.target.value })
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.birth_place}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_place: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.parent_name}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No HP Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.parent_phone}
                    onChange={(e) =>
                      setFormData({ ...formData, parent_phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
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
    </div>
  );
}

export default DataSiswa;
