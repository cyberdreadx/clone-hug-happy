import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, isPartner, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToConnect = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("connect")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document.getElementById("connect")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const publicLinks: { label: string; to: string; onClick?: (e: React.MouseEvent) => void }[] = [
    { label: "Home", to: "/" },
    { label: "Experience", to: "/events" },
    { label: "Contact", to: "/#connect", onClick: scrollToConnect },
  ];


  const dashboardLink = isAdmin
    ? { label: "Dashboard", to: "/admin" }
    : isPartner
    ? { label: "Portal", to: "/partner-portal" }
    : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="font-serif text-foreground text-sm tracking-wide">
          BREATHE &amp; BLOOM
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={l.onClick}
              className="text-muted-foreground text-xs tracking-wide uppercase hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}

          <a
            href="https://tr.ee/SzxICJnhQp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full text-white text-xs tracking-wide uppercase transition-colors"
            style={{ backgroundColor: "#c87a6f" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b66a5f")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c87a6f")}
          >
            Reserve
          </a>

          {!loading && !user && (
            <Link
              to="/login"
              className="text-muted-foreground text-xs tracking-wide uppercase hover:text-foreground transition-colors"
            >
              Log In
            </Link>
          )}

          {!loading && user && dashboardLink && (
            <Link
              to={dashboardLink.to}
              className="inline-flex items-center gap-1.5 text-gold text-xs tracking-wide uppercase hover:opacity-80 transition-opacity"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {dashboardLink.label}
            </Link>
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

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border/50 px-6 py-4 space-y-3">
          {publicLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={(e) => {
                if (l.onClick) l.onClick(e);
                else setOpen(false);
              }}
              className="block text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}

          <a
            href="https://tr.ee/SzxICJnhQp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium"
            style={{ color: "#c87a6f" }}
          >
            Reserve Your Seat
          </a>

          {!loading && !user && (
            <Link to="/login" onClick={() => setOpen(false)} className="block text-muted-foreground text-sm hover:text-foreground transition-colors">
              Log In
            </Link>
          )}

          {!loading && user && dashboardLink && (
            <Link to={dashboardLink.to} onClick={() => setOpen(false)} className="block text-gold text-sm hover:opacity-80 transition-opacity">
              {dashboardLink.label}
            </Link>
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
