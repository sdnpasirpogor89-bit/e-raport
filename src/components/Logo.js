// src/components/Logo.js
import React, { useState, useEffect, useRef, memo } from "react";
import { supabase } from "../supabaseClient";
import logoSekolah from "../assets/logo_sekolah.png";

const Logo = memo(
  ({
    size = "medium",
    showFallback = true,
    className = "",
    onLogoLoad = () => {},
  }) => {
    const [logoUrl, setLogoUrl] = useState(logoSekolah); // ✅ Default langsung ke local
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
      isMountedRef.current = true;

      // ✅ Hanya fetch sekali
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        fetchLogoFromDatabase();
      }

      return () => {
        isMountedRef.current = false;
      };
    }, []); // ✅ Empty dependency = hanya run sekali!

    const fetchLogoFromDatabase = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from("schools")
          .select("logo_url")
          .single();

        // ✅ Cek component masih mounted sebelum update state
        if (!isMountedRef.current) return;

        if (!dbError && data?.logo_url) {
          console.log("✅ Logo database loaded");
          setLogoUrl(data.logo_url);
        } else {
          console.log("📁 Gunakan logo lokal");
          // Sudah default ke logoSekolah
        }
      } catch (err) {
        console.error("Logo error:", err);
        // Tetap pakai logoSekolah (default)
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          onLogoLoad(true);
        }
      }
    };

    const sizeClasses = {
      small: "w-12 h-12",
      medium: "w-20 h-20",
      large: "w-28 h-28",
      xlarge: "w-32 h-32",
    };

    // Loading state
    if (isLoading) {
      return (
        <div
          className={`${sizeClasses[size]} ${className} bg-white/10 rounded-lg animate-pulse flex items-center justify-center backdrop-blur-sm`}>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      );
    }

    // ✅ Render logo - TANPA onError handler yang bikin loop!
    return (
      <img
        src={logoUrl}
        alt="Logo Sekolah"
        className={`${sizeClasses[size]} ${className} object-contain rounded-lg bg-white/5`}
        onError={(e) => {
          // ✅ Fallback ke emoji TANPA setState
          e.target.style.display = "none";
          e.target.parentElement.innerHTML = `
          <div class="${sizeClasses[size]} ${className} bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white/30">
            <span class="text-4xl">🏫</span>
          </div>
        `;
        }}
      />
    );
  }
);

Logo.displayName = "Logo";

export default Logo;
