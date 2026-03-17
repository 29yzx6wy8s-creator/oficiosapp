import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile } from "../hooks/useQueries";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity, isLoginError, loginError } =
    useInternetIdentity();
  const { data: profile, isFetched } = useCallerProfile();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect after successful login
  useEffect(() => {
    if (identity && isFetched) {
      if (profile) {
        navigate({ to: "/" });
      } else {
        navigate({ to: "/register" });
      }
    }
  }, [identity, isFetched, profile, navigate]);

  useEffect(() => {
    if (isLoginError && loginError) {
      toast.error("Error al iniciar sesión");
    }
  }, [isLoginError, loginError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos");
      return;
    }
    login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto flex items-center justify-center mb-3">
            <Wrench size={22} className="text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground mt-1">
            Inicia sesión para publicar y contactar profesionales
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1"
                data-ocid="login.input"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-ocid="login.show_password.toggle"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
              data-ocid="login.submit_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
                data-ocid="login.register.link"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Tu cuenta está protegida con autenticación segura.
        </p>
      </motion.div>
    </div>
  );
}
