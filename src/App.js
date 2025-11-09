import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import DataSiswa from "./pages/DataSiswa";
import DataGuru from "./pages/DataGuru";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check manual session dari localStorage atau sessionStorage
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Cek localStorage dulu (remember me)
      const savedSession = localStorage.getItem("erapor_session");
      let parsedSession = null;
      let fromLocalStorage = false;

      if (savedSession) {
        parsedSession = JSON.parse(savedSession);
        fromLocalStorage = true;
      } else {
        // Cek sessionStorage (tidak remember me)
        const tempSession = sessionStorage.getItem("erapor_session");
        if (tempSession) {
          parsedSession = JSON.parse(tempSession);
        }
      }

      if (parsedSession) {
        // Cek apakah session masih valid (belum expired)
        if (parsedSession.expires_at > Date.now()) {
          console.log(
            `✅ Session restored from ${
              fromLocalStorage ? "localStorage" : "sessionStorage"
            }`
          );

          // RE-FETCH user data yang fresh dari database
          const { data: freshUserData, error } = await supabase
            .from("users")
            .select(
              `
              *,
              schools (
                id,
                name,
                npsn,
                address,
                principal_name,
                logo_url
              )
            `
            )
            .eq("id", parsedSession.user.id)
            .eq("is_active", true)
            .single();

          if (error) {
            console.error("❌ Error fetching fresh user data:", error);
            // Session invalid, hapus
            localStorage.removeItem("erapor_session");
            sessionStorage.removeItem("erapor_session");
          } else if (freshUserData) {
            console.log("✅ Fresh user data fetched:", freshUserData);

            // Format ulang dengan nama lengkap
            const updatedUser = {
              id: freshUserData.id,
              username: freshUserData.username,
              role: freshUserData.role,
              nama: freshUserData.name,
              name: freshUserData.name,
              full_name: freshUserData.name,
              kelas: freshUserData.kelas,
              email:
                freshUserData.email || `${freshUserData.username}@sekolah.edu`,
              is_active: freshUserData.is_active,
              created_at: freshUserData.created_at,
              school_id: freshUserData.school_id,
              schools: freshUserData.schools || {
                id: freshUserData.school_id,
                name: "SDN 1 PASIRPOGOR",
                npsn: "-",
                address: "-",
                principal_name: "-",
                logo_url: null,
              },
            };

            // Update session dengan data fresh
            const updatedSession = {
              ...parsedSession,
              user: updatedUser,
            };

            // Update storage juga
            if (fromLocalStorage) {
              localStorage.setItem(
                "erapor_session",
                JSON.stringify(updatedSession)
              );
            } else {
              sessionStorage.setItem(
                "erapor_session",
                JSON.stringify(updatedSession)
              );
            }

            setSession(updatedSession);
          }
        } else {
          // Session expired, hapus
          console.log("⏰ Session expired, removing...");
          localStorage.removeItem("erapor_session");
          sessionStorage.removeItem("erapor_session");
        }
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // Clear invalid sessions
      localStorage.removeItem("erapor_session");
      sessionStorage.removeItem("erapor_session");
    } finally {
      setLoading(false);
    }
  };

  // Handle login success dari Login.js
  const handleLoginSuccess = (userData, rememberMe) => {
    console.log("🔥 App received userData:", userData);
    console.log("🔥 Remember me:", rememberMe);

    // Buat session object dengan struktur yang benar
    const sessionData = {
      user: userData,
      access_token: "manual-session-" + Date.now(),
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 jam
    };

    // Simpan ke localStorage atau sessionStorage
    if (rememberMe) {
      localStorage.setItem("erapor_session", JSON.stringify(sessionData));
      console.log("💾 Session saved to localStorage");
    } else {
      sessionStorage.setItem("erapor_session", JSON.stringify(sessionData));
      console.log("💾 Session saved to sessionStorage");
    }

    console.log("✅ Setting session:", sessionData);
    setSession(sessionData);
  };

  // Handle logout
  const handleLogout = () => {
    try {
      console.log("👋 Logging out...");
      // Hapus session dari storage
      localStorage.removeItem("erapor_session");
      sessionStorage.removeItem("erapor_session");

      // Clear state
      setSession(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/80 font-medium">Loading E-Rapor...</p>
        </div>
      </div>
    );
  }

  // Debug: Log session sebelum render Dashboard
  if (session) {
    console.log("🎯 Rendering Dashboard with session:", session);
    console.log("👤 User data:", session.user);
  }

  // Render Login atau Layout+Routes
  return (
    <Router>
      <div className="App">
        {!session ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Layout user={session.user} onLogout={handleLogout}>
            <Routes>
              {/* Dashboard Route */}
              <Route
                path="/"
                element={<Dashboard user={session.user} session={session} />}
              />

              {/* Data Siswa - Semua role bisa akses */}
              <Route
                path="/data-siswa"
                element={<DataSiswa user={session.user} />}
              />

              {/* Data Guru - Cuma Admin */}
              <Route
                path="/data-guru"
                element={
                  session.user.role === "admin" ? (
                    <DataGuru user={session.user} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;
