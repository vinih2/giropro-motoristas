'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Lightbulb, History, BarChart3, Crown } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/custo-km', label: 'Custo/KM', icon: Calculator },
    { href: '/insights', label: 'Insights', icon: Lightbulb },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/desempenho', label: 'Desempenho', icon: BarChart3 },
    { href: '/giropro-plus', label: 'GiroPro+', icon: Crown, premium: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:top-0 md:bottom-auto">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around md:justify-center md:gap-4 py-2 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px] ${
                  link.premium
                    ? isActive
                      ? 'text-yellow-600 bg-yellow-50'
                      : 'text-yellow-600 hover:bg-yellow-50'
                    : isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] md:text-xs font-medium text-center leading-tight">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
