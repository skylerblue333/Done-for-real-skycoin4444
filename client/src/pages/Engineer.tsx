import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Streamdown } from "streamdown";
import { Card, IconTile } from "@/components/ui/sk";
import { Cpu, Code2, ShieldAlert, Gauge, Bug, ScanSearch, Loader2 } from "lucide-react";

type Mode = "generate" | "review" | "optimize" | "security" | "debug";

const MODES: { id: Mode; label: string; icon: any; needsError?: boolean; codeInput: boolean }[] = [
  { id: "generate", label: "Generate", icon: Code2, codeInput: false },
  { id: "review", label: "Review", icon: ScanSearch, codeInput: true },
  { id: "optimize", label: "Optimize", icon: Gauge, codeInput: true },
  { id: "security", label: "Security Audit", icon: ShieldAlert, codeInput: true },
  { id: "debug", label: "Debug", icon: Bug, codeInput: true, needsError: true },
];

const LANGS = ["typescript", "javascript", "python", "rust", "go", "solidity", "java", "c++"];

export default function Engineer() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>("generate");
  const [text, setText] = useState("");
  const [errText, setErrText] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [output, setOutput] = useState("");

  const gen = trpc.engineer.generateCode.useMutation();
  const review = trpc.engineer.reviewCode.useMutation();
  const optimize = trpc.engineer.optimizeCode.useMutation();
  const security = trpc.engineer.securityAudit.useMutation();
  const debug = trpc.engineer.debugCode.useMutation();

  const pending = gen.isPending || review.isPending || optimize.isPending || security.isPending || debug.isPending;
  const active = MODES.find(m => m.id === mode)!;

  async function run() {
    if (!text.trim()) return;
    setOutput("");
    try {
      let res;
      if (mode === "generate") res = await gen.mutateAsync({ description: text, language });
      else if (mode === "review") res = await review.mutateAsync({ code: text, language });
      else if (mode === "optimize") res = await optimize.mutateAsync({ code: text, language });
      else if (mode === "security") res = await security.mutateAsync({ code: text, language });
      else res = await debug.mutateAsync({ code: text, error: errText, language });
      setOutput(res.output);
    } catch (e: any) {
      setOutput(`**Error:** ${e?.message ?? "Request failed"}`);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-24">
        <Card className="max-w-md mx-auto p-10 text-center">
          <IconTile icon={Cpu} accent="cyan" className="mx-auto" />
          <h1 className="font-extrabold text-2xl mb-2 mt-4">HopeAI Engineer</h1>
          <p className="text-muted-foreground mb-6">Connect your account to access live AI engineering tools.</p>
          <button className="sk-gradient px-6 py-3 rounded-full font-bold" onClick={() => (window.location.href = getLoginUrl())}>
            Connect to continue
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-2">
        <IconTile icon={Cpu} accent="cyan" />
        <div>
          <h1 className="font-extrabold text-3xl">HopeAI Software Engineer</h1>
          <p className="text-muted-foreground text-sm">Real, server-side LLM calls — generation, review, optimization, security & debugging.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 my-6">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setOutput(""); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              mode === id ? "sk-gradient" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-1.5 text-sm"
            >
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={active.codeInput ? 14 : 6}
            placeholder={active.codeInput ? "Paste your code here…" : "Describe what you want to build…"}
            className="font-mono text-sm bg-input border-border"
          />
          {active.needsError && (
            <Input
              value={errText}
              onChange={e => setErrText(e.target.value)}
              placeholder="Paste the error message (optional)"
              className="bg-input border-border"
            />
          )}
          <button
            onClick={run}
            disabled={pending || !text.trim()}
            className="w-full sk-gradient py-3 rounded-full font-bold transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
          >
            {pending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing…</> : `Run ${active.label}`}
          </button>
        </Card>

        <Card className="p-5 min-h-[300px]">
          <div className="text-xs uppercase tracking-widest text-[var(--neon-cyan)] mb-3">Output</div>
          {pending && <div className="text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> HopeAI is thinking…</div>}
          {!pending && !output && <div className="text-muted-foreground text-sm">Results will appear here.</div>}
          {output && (
            <div className="prose prose-invert max-w-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-border text-sm">
              <Streamdown>{output}</Streamdown>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
