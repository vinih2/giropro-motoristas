'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  const userPhoto = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="flex items-center gap-3">
      {/* Foto do usuário */}
      <div className="flex items-center gap-2">
        {userPhoto ? (
          <Image
            src={userPhoto}
            alt={userName}
            width={40}
            height={40}
            className="rounded-full border-2 border-orange-500"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center border-2 border-orange-500">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {userName}
        </span>
      </div>

      {/* Botão Sair */}
      <button
        onClick={signOut}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden md:block text-sm font-semibold">Sair</span>
      </button>
    </div>
  );
}
