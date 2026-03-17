export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-aura-in px-2`}>
      <div
        className={`relative group max-w-[90%] sm:max-w-[80%] px-8 py-6 rounded-[2.5rem] transition-all duration-700 ${
          isUser
            ? "bg-aura-accent/10 border border-aura-accent/20 text-aura-text rounded-tr-none shadow-aura-glow backdrop-blur-3xl"
            : "aura-glass text-aura-text/90 rounded-tl-none border-white/5 hover:bg-white/[0.07] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-3 mb-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-6 h-6 rounded-lg bg-aura-accent/20 flex items-center justify-center text-[10px] font-black text-aura-accent aura-border">G</div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">Aura Engine 2.0</span>
          </div>
        )}
        
        <div className={`text-[17px] leading-[1.6] tracking-wide antialiased whitespace-pre-wrap ${isUser ? "font-medium" : "font-light"}`}>
          {msg.content}
        </div>

        {/* Micro Timestamp */}
        <div className={`mt-4 text-[9px] font-bold uppercase tracking-widest text-aura-secondary/40 flex items-center gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="w-1 h-1 rounded-full bg-current opacity-20" />
          <span>{isUser ? "Verification Passed" : "Computation Finished"}</span>
        </div>

        {/* Interactive Highlight */}
        <div className={`absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 ${
           isUser ? "bg-aura-accent/5" : "bg-white/[0.02]"
        }`} />
      </div>
    </div>
  );
}
