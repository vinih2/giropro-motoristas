'use client';

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Lê o tema salvo ou define 'light' como padrão
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    // Aplica a classe 'dark' no HTML se necessário
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggle = () => {
    const t = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", t);
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      title="Alternar Tema"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
