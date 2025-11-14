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
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          localStorage.setItem("sb-session", JSON.stringify(session));
        } else {
          localStorage.removeItem("sb-session");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="pt-BR">
      <body className="antialiased bg-gradient-to-br from-orange-50 via-white to-yellow-50 min-h-screen">
        <Navbar />
        <main className="pb-20 pt-4 md:pt-20 md:pb-4">{children}</main>
      </body>
    </html>
  );
}
