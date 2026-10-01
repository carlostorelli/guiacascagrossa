import React from 'react';
import { Dumbbell, User } from 'lucide-react';

interface ChatMessageProps {
  sender: 'ai' | 'user';
  text: string;
  time?: string;
}

export function ChatMessage({ sender, text, time }: ChatMessageProps) {
  const isAi = sender === 'ai';

  return (
    <div className={`flex gap-3 max-w-2xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
          isAi
            ? 'bg-[#181C1F] border-[#B6FF3B]/40 text-[#B6FF3B]'
            : 'bg-[#B6FF3B] border-[#B6FF3B] text-[#080A0B]'
        }`}
      >
        {isAi ? <Dumbbell className="w-4 h-4" /> : <User className="w-4 h-4 font-bold" />}
      </div>

      {/* Bubble */}
      <div className="space-y-1">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isAi
              ? 'bg-[#111416] border border-[#292F33] text-[#F5F7F8] rounded-tl-sm'
              : 'bg-[#181C1F] border border-[#292F33] text-[#F5F7F8] rounded-tr-sm'
          }`}
        >
          {text}
        </div>
        {time && (
          <div
            className={`text-[10px] text-[#929A9F] px-1 ${
              isAi ? 'text-left' : 'text-right'
            }`}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  );
}
