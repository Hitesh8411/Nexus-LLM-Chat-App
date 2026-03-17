import { useState, useRef, useEffect } from "react";
import axios from "axios";
import MessageBubble from "./components/MessageBubble";
import PromptModeSelector from "./components/PromptModeSelector";
import InputBar from "./components/InputBar";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Aura Core initialized. I'm ready to process your requests with precision. How can I assist you?" }
  ]);
  const [mode, setMode] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [cooldownNow, setCooldownNow] = useState(() => Date.now());
  const [queue, setQueue] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setCooldownNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const sendNow = async ({ text, modeAtSend, skipUserEcho }) => {
    if (!skipUserEcho) {
      const userMsg = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/chat", {
        message: text,
        mode: modeAtSend,
      });

      let content = res.data.reply;
      if (modeAtSend === "classify" && res.data.classification) {
        const c = res.data.classification;
        const entities = Array.isArray(c.key_entities) ? c.key_entities.join(", ") : "";
        content =
          `Sentiment: ${c.sentiment}\n` +
          `Category: ${c.category}\n` +
          `Tone: ${c.tone}\n` +
          `Key Entities: ${entities || "None"}`;
      }

      setMessages((prev) => [...prev, { role: "assistant", content }]);
    } catch (err) {
      console.error("Chat Error:", err);
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 429) {
        const retryAfter =
          data?.retry_after_seconds ?? Number(err.response?.headers?.["retry-after"]) ?? null;
        if (retryAfter && Number.isFinite(retryAfter) && retryAfter > 0) {
          setCooldownUntil(Date.now() + Math.ceil(retryAfter) * 1000);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: retryAfter
              ? `⚠️ Rate limit reached. Please wait ${retryAfter}s. I’ll auto-send queued messages after the cooldown.`
              : "⚠️ Too many requests. I’ll auto-send queued messages after the cooldown.",
          },
        ]);
      } else {
        const errorMsg = data?.details || err.message || "An unexpected error occurred.";
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const enqueue = ({ text, modeAtSend }) => {
    setQueue((prev) => [...prev, { id: makeId(), text, modeAtSend }]);
  };

  const sendMessage = async (text) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed) return;

    const isCoolingDown = cooldownUntil && Date.now() < cooldownUntil;
    if (loading || isCoolingDown) {
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      enqueue({ text: trimmed, modeAtSend: mode });

      if (isCoolingDown) {
        const secondsLeft = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Queued. I’ll send it in ~${secondsLeft}s.` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Queued. I’ll send it right after the current response finishes." },
        ]);
      }
      return;
    }

    await sendNow({ text: trimmed, modeAtSend: mode, skipUserEcho: false });
  };

  const cooldownSecondsLeft =
    cooldownUntil && cooldownNow < cooldownUntil
      ? Math.max(0, Math.ceil((cooldownUntil - cooldownNow) / 1000))
      : 0;

  useEffect(() => {
    if (loading) return;
    if (cooldownSecondsLeft > 0) return;
    if (queue.length === 0) return;

    const next = queue[0];
    setQueue((prev) => prev.slice(1));
    // User already sees their message in chat, so don't echo again.
    void sendNow({ text: next.text, modeAtSend: next.modeAtSend, skipUserEcho: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, cooldownSecondsLeft, queue.length]);

  return (
    <div className="h-screen w-full bg-aura-bg bg-aura-glow flex overflow-hidden selection:bg-aura-accent/30 selection:text-white">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-aura-accent/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Minimalist Sidebar */}
      <aside className={`fixed h-full z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] aura-glass border-r border-white/5 flex flex-col ${sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full overflow-hidden"}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between min-w-[320px]">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-[0.4em] text-aura-accent">3-Pipe Architecture</h2>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2.5 rounded-xl hover:bg-white/10 text-white/50 transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 flex flex-col gap-3 mt-4 overflow-y-auto min-w-[320px]">
          <div className="text-[10px] text-aura-secondary uppercase tracking-[0.4em] font-black ml-2 mb-2 opacity-40">Pipeline Modes</div>
          
          <button onClick={() => { setMode('chat'); setSidebarOpen(false); }} className={`p-4 rounded-2xl transition-all text-left aura-border group ${mode === 'chat' ? 'bg-aura-accent/10 border-aura-accent/30 shadow-aura-glow' : 'hover:bg-white/5 border-transparent'}`}>
            <div className={`font-bold text-xs uppercase tracking-widest mb-1 ${mode === 'chat' ? 'text-aura-accent' : 'text-white/60 group-hover:text-aura-accent'}`}>💬 Chat</div>
            <p className="text-[10px] text-aura-secondary leading-relaxed opacity-70">General purpose conversational intelligence.</p>
          </button>

          <button onClick={() => { setMode('summarise'); setSidebarOpen(false); }} className={`p-4 rounded-2xl transition-all text-left aura-border group ${mode === 'summarise' ? 'bg-white/10 border-aura-accent/30 shadow-aura-glow' : 'hover:bg-white/5 border-transparent'}`}>
            <div className={`font-bold text-xs uppercase tracking-widest mb-1 ${mode === 'summarise' ? 'text-aura-accent' : 'text-white/60 group-hover:text-aura-accent'}`}>📝 Summarise</div>
            <p className="text-[10px] text-aura-secondary leading-relaxed opacity-70">Extract key points and TL;DR from text.</p>
          </button>

          <button onClick={() => { setMode('classify'); setSidebarOpen(false); }} className={`p-4 rounded-2xl transition-all text-left aura-border group ${mode === 'classify' ? 'bg-white/10 border-aura-accent/30 shadow-aura-glow' : 'hover:bg-white/5 border-transparent'}`}>
            <div className={`font-bold text-xs uppercase tracking-widest mb-1 ${mode === 'classify' ? 'text-aura-accent' : 'text-white/60 group-hover:text-aura-accent'}`}>🔍 Classify</div>
            <p className="text-[10px] text-aura-secondary leading-relaxed opacity-70">Analyze sentiment and categorizations.</p>
          </button>
        </div>

        <div className="p-6 flex justify-center min-w-[320px]">
          <div className="w-2 h-2 rounded-full bg-aura-accent shadow-cyan-glow animate-pulse" />
        </div>
      </aside>

      {/* Fixed Sidebar Toggle */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-8 left-8 z-40 p-4 rounded-2xl aura-glass text-white/40 hover:text-white transition-all shadow-xl border border-white/5 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </button>
      )}

      {/* Main Experience */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden h-full">
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 scrollbar-hide relative z-0">
          <div className="max-w-4xl mx-auto pt-24 pb-44">
            {/* Minimalist Header that scrolls away */}
            <header className="flex flex-col items-center justify-center mb-20 animate-aura-in">
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-2 opacity-30 scale-90 mb-4">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-aura-accent to-transparent" />
                  <span className="text-[10px] text-aura-secondary uppercase tracking-[0.6em] font-black">Prompt Pipeline</span>
                </div>
                
                <div className="transform transition-all">
                  <PromptModeSelector mode={mode} setMode={setMode} />
                </div>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="space-y-12">
              {messages.map((m, i) => (
                <MessageBubble key={i} msg={m} />
              ))}
              {loading && (
                <div className="flex justify-start animate-aura-in">
                  <div className="px-8 py-5 aura-glass rounded-[2rem] rounded-bl-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
                    <div className="flex gap-3">
                        <div className="w-2 h-2 bg-aura-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-aura-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-aura-accent rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>

        {/* Global Pill Input */}
        <div className="absolute bottom-10 left-0 right-0 px-6 z-30 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto transform transition-all hover:-translate-y-1">
             <InputBar
               onSend={sendMessage}
               loading={loading}
               cooldownSecondsLeft={cooldownSecondsLeft}
               queueLength={queue.length}
             />
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
        />
      )}
    </div>
  );
}
