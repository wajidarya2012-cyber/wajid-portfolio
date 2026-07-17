"use client";

import { useState }      from "react";
import { signIn }        from "next-auth/react";
import { useRouter }     from "next/navigation";
import { useForm }       from "react-hook-form";
import { zodResolver }   from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

interface Props {
  brandName:  string;
  subtitle:   string;
  footerNote: string;
}

export default function AdminLoginForm({ brandName, subtitle, footerNote }: Props) {
  const router                = useRouter();
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    if (submitted) return;
    setSubmitted(true);
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email:    data.email,
        password: data.password,
        redirect: false,
      });
      if (!result || result.error) {
        setError("Invalid email or password. Please check your credentials and try again.");
        return;
      }
      router.replace("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setSubmitted(false);
    }
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"rgba(255,255,255,0.04)",
    border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px",
    color:"#f1f5f9", fontFamily:"inherit", fontSize:"0.9rem",
    padding:"0.8rem 1rem", outline:"none",
    transition:"border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem", background:"#060B18" }}>
      <div style={{ position:"fixed", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 40%,rgba(79,70,229,0.12),transparent)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:"400px", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2rem", background:G, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"0.3rem" }}>
            {brandName}
          </div>
          <p style={{ fontSize:"0.78rem", color:"#475569", fontFamily:"'Fira Code',monospace", letterSpacing:"0.06em" }}>
            {subtitle}
          </p>
        </div>

        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px", padding:"2rem", backdropFilter:"blur(20px)" }}>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.25rem", fontWeight:700, marginBottom:"0.375rem", color:"#f1f5f9" }}>Sign in</h1>
          <p style={{ fontSize:"0.8rem", color:"#475569", marginBottom:"1.75rem" }}>Enter your credentials to access the dashboard.</p>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(onSubmit)(e);
            }}
            style={{ display:"flex", flexDirection:"column", gap:"1rem", opacity: loading ? 0.6 : 1, transition:"opacity 0.2s", pointerEvents: loading ? "none" : "auto" }}
          >
            <div>
              <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"#94a3b8", marginBottom:"0.35rem" }}>Email Address</label>
              <input {...register("email")} type="email" placeholder="admin@example.com" autoComplete="email" disabled={loading} style={inp}
                onFocus={e=>{ (e.target as HTMLInputElement).style.borderColor="#4f46e5"; (e.target as HTMLInputElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.18)"; }}
                onBlur={e =>{  (e.target as HTMLInputElement).style.borderColor="rgba(255,255,255,0.08)"; (e.target as HTMLInputElement).style.boxShadow="none"; }} />
              {errors.email && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.3rem" }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display:"block", fontSize:"0.75rem", fontWeight:600, color:"#94a3b8", marginBottom:"0.35rem" }}>Password</label>
              <input {...register("password")} type="password" placeholder="••••••••" autoComplete="current-password" disabled={loading} style={inp}
                onFocus={e=>{ (e.target as HTMLInputElement).style.borderColor="#4f46e5"; (e.target as HTMLInputElement).style.boxShadow="0 0 0 3px rgba(79,70,229,0.18)"; }}
                onBlur={e =>{  (e.target as HTMLInputElement).style.borderColor="rgba(255,255,255,0.08)"; (e.target as HTMLInputElement).style.boxShadow="none"; }} />
              {errors.password && <p style={{ fontSize:"0.72rem", color:"#f87171", marginTop:"0.3rem" }}>{errors.password.message}</p>}
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"8px", padding:"0.75rem 1rem", fontSize:"0.82rem", color:"#f87171" }}>
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={loading || submitted}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem", padding:"0.85rem 1.5rem", borderRadius:"10px", border:"none", background:G, color:"white", fontWeight:700, fontSize:"0.9rem", cursor:(loading||submitted)?"not-allowed":"pointer", opacity:(loading||submitted)?0.85:1, transition:"all 0.2s", marginTop:"0.25rem", boxShadow: loading ? "0 4px 24px rgba(79,70,229,0.6)" : "0 4px 20px rgba(79,70,229,0.4)", fontFamily:"inherit" }}>
              {loading ? (
                <>
                  <span style={{ display:"inline-block", width:"16px", height:"16px", border:"2.5px solid rgba(255,255,255,0.35)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.6s linear infinite", flexShrink:0 }} />
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </form>

          {loading && (
            <div style={{ marginTop:"1rem", height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
              <div style={{ height:"100%", width:"40%", borderRadius:"2px", background:G, animation:"loadingBar 1.1s ease-in-out infinite" }} />
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:"0.72rem", color:"#334155", marginTop:"1.5rem" }}>
          {footerNote}
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loadingBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}