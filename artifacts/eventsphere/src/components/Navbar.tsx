import { Link, useLocation } from "wouter";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/explore?view=categories", label: "Categories" },
    { href: "/gallery", label: "Calendar" },
    { href: "/gallery", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground" data-testid="nav-logo">
            <Globe className="w-5 h-5 text-primary" />
            EventSphere
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard/organizer">
              <Button variant="ghost" size="sm" data-testid="nav-create-event">
                Create Event
              </Button>
            </Link>
            <div className="w-px h-4 bg-border" />
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="nav-login">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" data-testid="nav-signup">
                Sign up
              </Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden py-3 border-t border-border space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Sign up</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
