import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Globe, Github, Mail, Eye, EyeOff, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { DEMO_ACCOUNTS, type DemoAccountKey } from "@/lib/auth-service";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const login = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          const role = data.user.role;
          if (role === "admin") setLocation("/dashboard/admin");
          else if (role === "organizer") setLocation("/dashboard/organizer");
          else setLocation("/dashboard/participant");
        },
        onError: () => setError("Invalid email or password. Please try again."),
      }
    );
  }

  function handleDemoLogin(account: DemoAccountKey) {
    const credentials = DEMO_ACCOUNTS[account];
    setForm({ email: credentials.email, password: credentials.password });
    setError("");
    login.mutate(
      { data: credentials },
      {
        onSuccess: (data) => {
          const role = data.user.role;
          if (role === "admin") setLocation("/dashboard/admin");
          else if (role === "organizer") setLocation("/dashboard/organizer");
          else setLocation("/dashboard/participant");
        },
        onError: () => setError("Demo login failed. Please try again."),
      }
    );
  }

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg" data-testid="auth-logo">
            <Globe className="w-5 h-5 text-indigo-400" />
            EventSphere
          </Link>
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="text-white text-xl font-medium leading-relaxed mb-4">
            "Managing our college hackathon used to take weeks of coordination. With EventSphere, we did it in hours."
          </blockquote>
          <p className="text-indigo-300 text-sm">— Marcus D., Arts Society President</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-6">Sign in to your EventSphere account.</p>

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

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex.j@university.edu"
                className="mt-1"
                data-testid="input-email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pr-10"
                  data-testid="input-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-testid="toggle-password">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="submit-login">
              {login.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline" data-testid="link-signup">Sign up</Link>
          </p>

          <div className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("admin")}
                className="text-xs"
                data-testid="demo-admin"
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("organizer")}
                className="text-xs"
                data-testid="demo-organizer"
              >
                Organizer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin("student")}
                className="text-xs"
                data-testid="demo-student"
              >
                Student
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Click to auto-fill and login with demo credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
