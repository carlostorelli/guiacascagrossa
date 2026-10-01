'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CouponBadge } from '@/components/ui/CouponBadge';
import { Dumbbell, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'recovery') {
      setSubmittedMessage(`Instruções de recuperação enviadas para ${email}`);
      return;
    }

    // Save demo user session
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'brigadeiro_user',
        JSON.stringify({
          name: name || 'Atleta',
          email,
          logged_in: true,
        })
      );
    }

    router.push('/chat');
  };

  const handleGuestAccess = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'brigadeiro_user',
        JSON.stringify({
          name: 'Atleta Visitante',
          email: 'guest@brigadeiro.fit',
          logged_in: true,
        })
      );
    }
    router.push('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-[#111416] border border-[#292F33] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Pill */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#181C1F] border border-[#B6FF3B]/40 flex items-center justify-center mx-auto text-[#B6FF3B]">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black uppercase text-[#F5F7F8] tracking-tight">
              {mode === 'login' && 'Acessar Minha Conta'}
              {mode === 'register' && 'Criar Nova Conta'}
              {mode === 'recovery' && 'Recuperar Senha'}
            </h1>
            <p className="text-xs text-[#929A9F]">
              BRIGADEIRO FIT AI • Assistente Inteligente
            </p>
          </div>

          {submittedMessage ? (
            <div className="p-4 rounded-xl bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 text-center space-y-3">
              <p className="text-xs font-bold text-[#B6FF3B]">{submittedMessage}</p>
              <button
                onClick={() => {
                  setSubmittedMessage(null);
                  setMode('login');
                }}
                className="text-xs text-[#F5F7F8] underline"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[#929A9F] font-bold">Seu Nome</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#929A9F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Carlos Silva"
                      className="w-full bg-[#181C1F] border border-[#292F33] focus:border-[#B6FF3B] text-[#F5F7F8] pl-10 pr-3 py-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[#929A9F] font-bold">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#929A9F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-[#181C1F] border border-[#292F33] focus:border-[#B6FF3B] text-[#F5F7F8] pl-10 pr-3 py-2.5 rounded-xl outline-none"
                  />
                </div>
              </div>

              {mode !== 'recovery' && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[#929A9F] font-bold">Senha</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('recovery')}
                        className="text-[10px] text-[#B6FF3B] hover:underline"
                      >
                        Esqueceu?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#929A9F] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#181C1F] border border-[#292F33] focus:border-[#B6FF3B] text-[#F5F7F8] pl-10 pr-3 py-2.5 rounded-xl outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 neon-glow cursor-pointer mt-2"
              >
                {mode === 'login' && 'Entrar na Plataforma'}
                {mode === 'register' && 'Cadastrar e Continuar'}
                {mode === 'recovery' && 'Enviar Recuperação'}
              </button>

              {/* Google Login button */}
              <button
                type="button"
                onClick={handleGuestAccess}
                className="w-full py-2.5 bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] text-[#F5F7F8] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Continuar com Google</span>
              </button>

              {/* Guest Access shortcut */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  className="text-xs text-[#929A9F] hover:text-[#B6FF3B] underline cursor-pointer"
                >
                  Ou continuar como visitante sem senha →
                </button>
              </div>

              {/* Toggle mode links */}
              <div className="text-center pt-4 border-t border-[#181C1F] text-xs text-[#929A9F]">
                {mode === 'login' ? (
                  <span>
                    Ainda não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[#B6FF3B] font-bold hover:underline"
                    >
                      Cadastre-se grátis
                    </button>
                  </span>
                ) : (
                  <span>
                    Já possui conta?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#B6FF3B] font-bold hover:underline"
                    >
                      Faça login
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
