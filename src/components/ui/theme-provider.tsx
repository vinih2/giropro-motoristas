import "./globals.css";
import Navbar from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/ui/theme-provider"; // ✅ Importar
import { Toaster } from "@/components/ui/toaster"; // ✅ Adicionar Toaster se não tiver

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="pb-24 pt-20 md:pt-24 md:pb-8">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
