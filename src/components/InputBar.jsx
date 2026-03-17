import { useState, useRef, useEffect } from "react";

export default function InputBar({
  onSend,
  loading,
  cooldownSecondsLeft = 0,
  queueLength = 0,
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form
      onSubmit={handleSubmit}
      className="aura-glass p-2.5 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] group transition-all duration-700 focus-within:ring-2 focus-within:ring-aura-accent/20"
    >
      <div className="flex items-end gap-2 px-4">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={
            cooldownSecondsLeft > 0
              ? `Rate limited. Wait ${cooldownSecondsLeft}s...`
              : "Command Aura Intelligence..."
          }
          rows="1"
          className="flex-1 bg-transparent text-aura-text/90 py-5 outline-none text-lg font-light placeholder:text-aura-secondary/30 max-h-60 scrollbar-hide resize-none leading-relaxed"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className={`mb-2 p-5 rounded-[2rem] transition-all duration-700 shadow-2xl relative overflow-hidden group/btn ${
            !input.trim()
              ? "bg-white/5 text-white/10 cursor-not-allowed"
              : "bg-cyan-purple-gradient text-white hover:shadow-cyan-glow hover:scale-[1.05] active:scale-95"
          }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1">
              <path d="M3.478 2.404a.75.75 0 0 1 .926-.235l18.5 9.25a.75.75 0 0 1 0 1.342l-18.5 9.25a.75.75 0 0 1-.926-1.05l3.52-3.141a.75.75 0 0 1 .462-.224l13.212-1.321L7.02 11.226a.75.75 0 0 1-.463-.224l-3.52-3.14z" />
            </svg>
          )}
          
          {/* Button Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] pointer-events-none" />
        </button>
      </div>

      {(cooldownSecondsLeft > 0 || queueLength > 0) && (
        <div className="px-6 pb-3 -mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-aura-secondary/60 flex items-center justify-between">
          <span>
            {cooldownSecondsLeft > 0
              ? `Cooldown ${cooldownSecondsLeft}s`
              : loading
                ? "Sending…"
                : "Ready"}
          </span>
          <span>{queueLength > 0 ? `Queued ${queueLength}` : ""}</span>
        </div>
      )}
    </form>
  );
}
