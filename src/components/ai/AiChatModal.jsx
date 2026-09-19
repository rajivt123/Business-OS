import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, X, Trash2, Loader2 } from 'lucide-react';
import { useCrm } from '../../context/CrmContext';

export default function AiChatModal() {
  const {
    isDarkMode,
    isAiChatOpen,
    setIsAiChatOpen,
    aiChatMessages,
    isAiChatSending,
    handleSendAiChatMessage,
    handleClearAiChat,
    works,
    activeWorkId,
    issues,
    missingData
  } = useCrm();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (isAiChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, isAiChatSending, isAiChatOpen]);

  const openIssuesCount = (issues || []).filter(i => i.status === 'open').length;

  const suggestionChips = [
    { label: '📊 Portfolio Report (All Projects)', query: 'Generate a comprehensive executive status report for ALL projects across all clients and units in the system.' },
    { label: '✉️ Draft Status Email', query: 'Draft a professional progress update email regarding recent project activity.' },
    { label: `🚨 Open Snags (${openIssuesCount})`, query: 'What open snags or issues need attention right now?' },
    { label: `⚠️ Missing Data (${(missingData || []).length})`, query: 'Which projects are missing PO, WO, or BOQ files?' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAiChatSending) return;
    const query = inputQuery;
    setInputQuery('');
    handleSendAiChatMessage(query);
  };

  const handleChipClick = (chipQuery) => {
    if (isAiChatSending) return;
    handleSendAiChatMessage(chipQuery);
  };

  const tModal = isDarkMode ? "bg-slate-900 border-slate-700 text-slate-100 shadow-slate-950/90" : "bg-white border-slate-200 text-slate-800 shadow-2xl";
  const tHeader = isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-slate-50 border-slate-200";
  const tInput = isDarkMode ? "bg-slate-950 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-sky-500" : "bg-slate-50 border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-sky-500";
  const customScrollbar = `[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${isDarkMode ? '[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-600' : '[&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400'}`;

  return (
    <>
      {/* Smooth Animated Backdrop overlay */}
      <div 
        onClick={() => setIsAiChatOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-all duration-300 ${
          isAiChatOpen ? 'opacity-100 backdrop-blur-sm pointer-events-auto' : 'opacity-0 backdrop-blur-none pointer-events-none'
        }`}
      />

      {/* Smooth Right-Side Vertical Copilot Panel Drawer */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[520px] h-full border-l flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-out transform ${
          isAiChatOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'
        } ${tModal}`}
      >
        
        {/* TOP PANEL HEADER */}
        <div className={`px-5 py-4 flex justify-between items-center border-b shrink-0 ${tHeader}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2 leading-none">
                Assistant
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearAiChat}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-rose-400' : 'hover:bg-slate-200 text-slate-500 hover:text-rose-600'}`}
              title="Clear Chat History"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={() => setIsAiChatOpen(false)}
              className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-600'}`}
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SUGGESTION CHIPS */}
        <div className={`px-4 py-2.5 border-b flex gap-2 overflow-x-auto shrink-0 ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-100/60 border-slate-200'} ${customScrollbar}`}>
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.query)}
              disabled={isAiChatSending}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all shrink-0 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-sky-950 hover:border-sky-600 hover:text-sky-300' : 'bg-white border-slate-300 text-slate-700 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-700 shadow-sm'}`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* MESSAGES CONVERSATION BODY */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${customScrollbar}`}>
          {aiChatMessages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white shrink-0 shadow mt-0.5">
                    <Bot size={15} />
                  </div>
                )}

                <div className={`max-w-[86%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  isAi
                    ? (isDarkMode ? 'bg-slate-800/90 border border-slate-700 text-slate-200' : 'bg-slate-100 border border-slate-200 text-slate-800')
                    : 'bg-sky-600 text-white font-medium rounded-br-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-2 font-mono text-right ${isAi ? (isDarkMode ? 'text-slate-400' : 'text-slate-400') : 'text-sky-100'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {!isAi && (
                  <div className="w-7 h-7 rounded-full bg-sky-700 flex items-center justify-center text-white shrink-0 shadow mt-0.5">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          {isAiChatSending && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white shrink-0 shadow mt-0.5">
                <Bot size={15} />
              </div>
              <div className={`p-3.5 rounded-2xl text-sm border flex items-center gap-2 ${isDarkMode ? 'bg-slate-800/90 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                <Loader2 size={16} className="animate-spin text-sky-500" />
                <span>Google Gemini is generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM FOOTER */}
        <form onSubmit={handleSubmit} className={`p-4 border-t shrink-0 flex items-center gap-2.5 ${tHeader}`}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI, request project reports, or draft emails..."
            disabled={isAiChatSending}
            className={`flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none border transition-all ${tInput}`}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAiChatSending}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition shadow-md disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            {isAiChatSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

      </div>
    </>
  );
}
