'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calculator,
  Lightbulb,
  History,
  BarChart3,
  Crown,
} from 'lucide-react';
import UserMenu from './user-menu';
import ThemeToggle from '@/components/ThemeToggle'; // ← ADICIONADO

export default function Navbar() {
  const pathname = usePathname();

  // Não mostrar navbar na página de login
  if (pathname === '/login') return null;

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/custo-km', label: 'Custo/KM', icon: Calculator },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/desempenho', label: 'Desempenho', icon: BarChart3 },
    { href: '/giropro-plus', label: 'GiroPro+', icon: Crown, premium: true },
  ];

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200 shadow-lg
        dark:bg-gray-900 dark:border-gray-700 dark:shadow-black/30
        md:top-0 md:bottom-auto
      "
    >
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between">
          {/* Links de navegação */}
          <div className="flex justify-around md:justify-start md:gap-4 py-2 overflow-x-auto flex-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px]

                    ${
                      link.premium
                        ? isActive
                          ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-300'
                          : 'text-yellow-600 hover:bg-yellow-50 dark:text-yellow-300 dark:hover:bg-yellow-900/20'
                        : isActive
                        ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50 dark:text-gray-300 dark:hover:text-orange-300 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] md:text-xs font-medium text-center leading-tight">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Botões extras no desktop */}
          <div className="hidden md:flex items-center gap-3 py-2">
            <ThemeToggle /> {/* ← ADICIONADO */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* TOP NAV - mobile only */}
      <div
        className="
          md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3
          bg-white border-b border-gray-200 shadow-md
          dark:bg-gray-900 dark:border-gray-700 dark:shadow-black/30
        "
      >
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
            GiroPro
          </h1>

          <div className="flex items-center gap-3">
            <ThemeToggle /> {/* ← ADICIONADO */}
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
