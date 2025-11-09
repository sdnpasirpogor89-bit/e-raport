import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { supabase } from "../supabaseClient";

/**
 * SemesterSelector - Reusable component untuk pilih semester
 *
 * Props:
 * - value: semester yang dipilih (string)
 * - onChange: callback saat semester berubah (semester) => void
 * - disabled: disable selector (boolean)
 * - className: custom className
 * - label: custom label text
 * - required: field required or not
 * - placeholder: custom placeholder
 * - showIcon: show calendar icon (default: true)
 * - variant: 'default' | 'compact' (default: 'default')
 */
export default function SemesterSelector({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Semester",
  required = false,
  placeholder = "Pilih Semester",
  showIcon = true,
  variant = "default",
}) {
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch semester dari database
  useEffect(() => {
    fetchSemesters();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSemesters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("academic_years")
        .select("name")
        .eq("is_active", true)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching semesters:", error);
        setError("Gagal memuat data semester");
        // Fallback ke hardcode
        setSemesterOptions(["2025/2026 Ganjil", "2025/2026 Genap"]);
      } else {
        // Generate Ganjil & Genap dari setiap academic year
        const semesters = [];
        data.forEach((item) => {
          semesters.push(`${item.name} Ganjil`);
          semesters.push(`${item.name} Genap`);
        });
        setSemesterOptions(
          semesters.length > 0
            ? semesters
            : ["2025/2026 Ganjil", "2025/2026 Genap"]
        );
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Terjadi kesalahan sistem");
      setSemesterOptions(["2025/2026 Ganjil", "2025/2026 Genap"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (semester) => {
    onChange(semester);
    setIsDropdownOpen(false);
  };

  // Retry fetch jika error
  const handleRetry = () => {
    fetchSemesters();
  };

  // Variant styles
  const isCompact = variant === "compact";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && !isCompact && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() =>
          !disabled && !isLoading && setIsDropdownOpen(!isDropdownOpen)
        }
        disabled={disabled || isLoading}
        className={`
          w-full flex items-center justify-between gap-2
          ${isCompact ? "px-3 py-2 text-sm" : "px-4 py-3"}
          bg-white border-2 rounded-lg
          transition-all duration-300
          ${
            disabled || isLoading
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : error
              ? "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          }
          focus:outline-none
          ${!value && !isLoading ? "text-gray-400" : "text-slate-700"}
        `}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showIcon && !isCompact && (
            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
          <span className="truncate">
            {isLoading ? "Memuat semester..." : value || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Error Message */}
      {error && !isCompact && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Dropdown Options */}
      {isDropdownOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg border-2 border-slate-200 shadow-xl overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {/* Custom scrollbar */}
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: #f1f5f9;
              }
              div::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 10px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>

            {semesterOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Tidak ada data semester</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium underline">
                  Muat Ulang
                </button>
              </div>
            ) : (
              semesterOptions.map((option, index) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(-1)}
                  className={`
                    px-4 py-3 cursor-pointer transition-all duration-200
                    ${isCompact ? "text-sm" : ""}
                    ${
                      hoveredIndex === index
                        ? "bg-gray-300 text-slate-800 font-medium"
                        : value === option
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "bg-white text-slate-700 hover:bg-gray-50"
                    }
                  `}>
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {value === option && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Required indicator */}
      {required && !value && !isCompact && (
        <p className="mt-1 text-xs text-gray-500">* Field ini wajib diisi</p>
      )}
    </div>
  );
}

// BONUS: Hook helper untuk manage semester state
export function useSemester(initialSemester = "") {
  const [semester, setSemester] = useState(initialSemester);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(!!semester && semester.trim().length > 0);
  }, [semester]);

  const handleChange = (newSemester) => {
    setSemester(newSemester);
  };

  const reset = () => {
    setSemester("");
  };

  return {
    semester,
    setSemester: handleChange,
    reset,
    isValid,
  };
}
