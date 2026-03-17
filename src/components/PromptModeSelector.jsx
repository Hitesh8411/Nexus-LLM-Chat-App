export default function PromptModeSelector({ mode, setMode }) {
  const modes = [
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "summarise", label: "Summarise", icon: "📝" },
    { id: "classify", label: "Classify", icon: "🔍" },
  ];

  return (
    <div className="p-1.5 flex gap-1 aura-glass rounded-[1.5rem] border border-white/5 text-white/40 shadow-2xl">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.25rem] transition-all duration-500 text-xs font-bold uppercase tracking-widest ${
            mode === m.id
              ? "bg-white/10 text-aura-accent shadow-aura-glow border border-white/10"
              : "hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="text-lg leading-none">{m.icon}</span>
          <span className="hidden md:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
