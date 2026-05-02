import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Github, Mail, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<"participant" | "organizer">("participant");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const signUp = useSignUp();

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName) e.fullName = "Full name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email is required";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters long";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    signUp.mutate(
      { data: { ...form, role } },
      { onSuccess: () => setLocation(role === "organizer" ? "/dashboard/organizer" : "/dashboard/participant") }
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="signup-page">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg" data-testid="auth-logo">
            <Globe className="w-5 h-5 text-indigo-400" />
            EventSphere
          </Link>
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-4">
            "This platform completely transformed how we manage college fests. Seamless, intuitive, and incredibly powerful."
          </blockquote>
          <p className="text-indigo-300 text-sm">— Sarah Jenkins, Student Council President</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">Create an account</h1>
          <p className="text-muted-foreground text-sm mb-6">Join EventSphere to discover and manage college events.</p>

          {/* Role selector */}
          <div className="mb-5">
            <p className="text-sm font-medium mb-2">I am a...</p>
            <div className="grid grid-cols-2 gap-3">
              {(["participant", "organizer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  data-testid={`role-${r}`}
                  className={cn(
                    "relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all",
                    role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  {role === r && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold", role === r ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                    {r === "participant" ? "S" : "O"}
                  </div>
                  <span className="text-sm font-semibold capitalize">{r === "participant" ? "Student" : "Organizer"}</span>
                  <span className="text-xs text-muted-foreground">{r === "participant" ? "Join events & track certificates" : "Host events & manage attendees"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button variant="outline" className="gap-2 text-sm" data-testid="github-login">
              <Github className="w-4 h-4" /> GitHub
            </Button>
            <Button variant="outline" className="gap-2 text-sm" data-testid="google-login">
              <Mail className="w-4 h-4" /> Google
            </Button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-2 w-fit mx-auto">Or continue with email</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Alex Johnson"
                className={cn("mt-1", errors.fullName && "border-destructive")}
                data-testid="input-fullname"
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex.j@university.edu"
                className={cn("mt-1", errors.email && "border-destructive")}
                data-testid="input-email"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className={cn("pr-10", errors.password && "border-destructive")}
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="toggle-password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><span className="text-destructive">⊗</span> {errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={signUp.isPending} data-testid="submit-signup">
              {signUp.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-3">
            By clicking continue, you agree to our{" "}
            <a href="#" className="underline">Terms of Service</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
