// src/components/Dashboard.js
import React from "react";
import DashboardAdmin from "./DashboardAdmin";
import DashboardTeacher from "./DashboardTeacher";
import DashboardHomeroomTeacher from "./DashboardHomeroomTeacher";

function Dashboard({ user, session }) {
  // Debug log
  console.log("🎯 Dashboard Router - User role:", user?.role);

  // Route berdasarkan role
  const renderDashboard = () => {
    switch (user?.role) {
      case "admin":
        return <DashboardAdmin user={user} session={session} />;

      case "wali_kelas":
        return <DashboardHomeroomTeacher user={user} session={session} />;

      case "guru":
      case "guru_kelas":
        return <DashboardTeacher user={user} session={session} />;

      default:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Role tidak dikenali
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    Role pengguna Anda ({user?.role || "tidak ada"}) tidak
                    memiliki dashboard yang sesuai. Silakan hubungi
                    administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderDashboard();
}

export default Dashboard;
