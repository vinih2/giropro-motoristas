'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Settings, FileText, Download } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  const userPhoto = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const handleExport = async () => {
    // Função simples de exportação CSV
    const { data } = await supabase.from('registros').select('*').eq('user_id', user.id);
    if (!data) return alert('Sem dados para exportar');

    const csvContent = "data:text/csv;charset=utf-8," 
        + "Data,Plataforma,Lucro,KM,Horas\n"
        + data.map(r => `${r.data},${r.plataforma},${r.lucro},${r.km},${r.horas}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "giropro_relatorio.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
          {userPhoto ? (
            <Image src={userPhoto} alt={userName} width={40} height={40} className="rounded-full border-2 border-orange-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
              <User size={20} />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" /> Exportar Relatório (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
