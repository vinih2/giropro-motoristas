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
    // --- Persistência Supabase ---
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          localStorage.setItem("sb-session", JSON.stringify(session));
        } else {
          localStorage.removeItem("sb-session");
        }
      }
    );

    // --- ⚡ Ativa dark mode global ---
    document.documentElement.classList.add("dark");

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="
          min-h-screen 
          bg-background text-foreground
          transition-colors duration-300
        "
      >
        <Navbar />
        <main className="pb-20 pt-4 md:pt-20 md:pb-4">{children}</main>
      </body>
    </html>
  );
}
