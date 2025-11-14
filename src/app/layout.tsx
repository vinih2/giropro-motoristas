"use client";

import "./globals.css";
import Navbar from "@/components/custom/navbar";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Persistência Supabase
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          localStorage.setItem("sb-session", JSON.stringify(session));
        } else {
          localStorage.removeItem("sb-session");
        }
      }
    );

    // ✅ LÓGICA CORRETA: Lê do localStorage em vez de forçar
    const theme = localStorage.getItem("theme") || "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="
          antialiased min-h-screen 
          bg-gradient-to-br from-orange-50 via-white to-yellow-50
          dark:from-gray-950 dark:via-gray-900 dark:to-black
          text-gray-800 dark:text-gray-100
          transition-colors duration-300
        "
      >
        <Navbar />
        <main className="pb-24 pt-20 md:pt-24 md:pb-8">{children}</main>
      </body>
    </html>
  );
}
