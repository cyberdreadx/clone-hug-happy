import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, isPartner, loading, signOut } = useAuth();

  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "Experience", href: "/#experience" },
    { label: "RSVP", href: "/rsvp" },
  ];

  const dashboardLink = isAdmin
    ? { label: "Dashboard", href: "/admin" }
    : isPartner
    ? { label: "Portal", href: "/partner-portal" }
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="font-serif text-foreground text-sm tracking-wide">
          BREATHE &amp; BLOOM
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-muted-foreground text-xs tracking-wide uppercase hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}

          {!loading && !user && (
            <a
              href="/login"
              className="text-muted-foreground text-xs tracking-wide uppercase hover:text-foreground transition-colors"
            >
              Partner Login
            </a>
          )}

          {!loading && user && dashboardLink && (
            <a
              href={dashboardLink.href}
              className="inline-flex items-center gap-1.5 text-gold text-xs tracking-wide uppercase hover:opacity-80 transition-opacity"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {dashboardLink.label}
            </a>
          )}

          {!loading && user && (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 text-muted-foreground text-xs tracking-wide uppercase hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t border-border/50 px-6 py-4 space-y-3">
          {publicLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}

          {!loading && !user && (
            <a href="/login" onClick={() => setOpen(false)} className="block text-muted-foreground text-sm hover:text-foreground transition-colors">
              Partner Login
            </a>
          )}

          {!loading && user && dashboardLink && (
            <a href={dashboardLink.href} onClick={() => setOpen(false)} className="block text-gold text-sm hover:opacity-80 transition-opacity">
              {dashboardLink.label}
            </a>
          )}

          {!loading && user && (
            <button onClick={() => { signOut(); setOpen(false); }} className="block text-muted-foreground text-sm hover:text-foreground transition-colors">
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
