import type { Config } from "tailwindcss";
// ✅ CORREÇÃO: Importar o plugin diretamente no topo
import tailwindAnimate from "tailwindcss-animate"; 

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  // ✅ Usar o plugin importado na lista
  plugins: [tailwindAnimate], 
};
export default config;
