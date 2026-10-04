import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { Send, FileText, Shield, Sparkles } from 'lucide-react';

interface ChatSystemProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'agency' | 'worker' | 'client';
  onSendMessage: (recipientId: string, content: string) => void;
  workers: Array<{ id: string; name: string; role: string }>;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  messages,
  currentUserId,
  currentUserName,
  currentUserRole,
  onSendMessage,
  workers,
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    currentUserRole === 'agency' ? workers[0]?.id || 'w-sarah' : 'agency'
  );
  const [inputText, setInputText] = useState('');

  const filteredMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUserId && msg.recipientId === selectedRecipientId) ||
      (msg.senderId === selectedRecipientId && msg.recipientId === currentUserId)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(selectedRecipientId, inputText);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex h-[550px]">
      {/* Sidebar - only active for Agency Coordinator to choose which worker/client to chat with */}
      {currentUserRole === 'agency' && (
        <div className="w-64 border-r border-slate-100 bg-slate-50 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="text-sm font-semibold text-slate-800">CQC Audit Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">Compliant Messaging Log</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {workers.map((worker) => (
              <button
                key={worker.id}
                onClick={() => setSelectedRecipientId(worker.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  selectedRecipientId === worker.id
                    ? 'bg-blue-50 border border-blue-100 text-blue-950'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {worker.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{worker.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{worker.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {currentUserRole === 'agency'
                ? `Secure Thread: ${workers.find((w) => w.id === selectedRecipientId)?.name || 'Caregiver'}`
                : 'Nexora Support & Coordination Hub'}
            </h3>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-500">CQC-Approved Secure Audit Channel</span>
            </div>
          </div>
          <div className="flex items-center bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-medium border border-amber-100 space-x-1">
            <Shield className="w-3 h-3" />
            <span>Audit Logging Active</span>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Start a Secure Conversation</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Messages on this portal are timestamped and logged permanently for CQC audit proof, replacing unsafe external messaging.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                    {!isMe && (
                      <p className="text-[10px] font-bold text-blue-700 mb-0.5 uppercase tracking-wider">
                        {msg.senderName} ({msg.senderRole})
                      </p>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to log onto secure audit trail..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
