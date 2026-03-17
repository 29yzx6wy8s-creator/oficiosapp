import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  User,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export function Navbar() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useCallerProfile();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-ocid="nav.link">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Wrench size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display text-xl text-foreground">
            OficiosYa
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                data-ocid="nav.messages.link"
              >
                <Link to="/messages">
                  <MessageSquare size={16} className="mr-1.5" />
                  Mensajes
                </Link>
              </Button>
              <Button
                asChild
                variant="default"
                size="sm"
                data-ocid="nav.create.button"
              >
                <Link to="/listings/new">
                  <Plus size={16} className="mr-1.5" />
                  Publicar
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    data-ocid="nav.profile.button"
                  >
                    <User size={16} className="mr-1.5" />
                    {profile?.name || "Mi perfil"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" data-ocid="nav.dropdown_menu">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" data-ocid="nav.profile.link">
                      <User size={14} className="mr-2" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
                    data-ocid="nav.logout.button"
                  >
                    <LogOut size={14} className="mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                data-ocid="nav.login.link"
              >
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild size="sm" data-ocid="nav.register.link">
                <Link to="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menú"
          data-ocid="nav.toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/messages"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
                data-ocid="nav.mobile.messages.link"
              >
                Mensajes
              </Link>
              <Link
                to="/listings/new"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
                data-ocid="nav.mobile.create.link"
              >
                Publicar servicio
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
                data-ocid="nav.mobile.profile.link"
              >
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 text-sm text-destructive text-left"
                data-ocid="nav.mobile.logout.button"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
                data-ocid="nav.mobile.login.link"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm"
                data-ocid="nav.mobile.register.link"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
