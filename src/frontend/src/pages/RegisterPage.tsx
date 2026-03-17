import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerProfile, useSaveProfile } from "../hooks/useQueries";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, identity, isInitializing } =
    useInternetIdentity();
  const { data: profile, isFetched } = useCallerProfile();
  const saveProfile = useSaveProfile();

  const [step, setStep] = useState<"credentials" | "profile">("credentials");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [isClient, setIsClient] = useState(true);

  // When authenticated and profile not set, show profile step
  useEffect(() => {
    if (identity && isFetched) {
      if (profile) {
        navigate({ to: "/" });
      } else {
        setStep("profile");
      }
    }
  }, [identity, isFetched, profile, navigate]);

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      toast.error("Por favor, completa todos los campos");
      return;
    }
    login();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync({ name, email, isWorker, isClient });
      toast.success("¡Cuenta creada correctamente!");
      navigate({ to: "/" });
    } catch {
      toast.error("Error al guardar el perfil");
    }
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
          <h1 className="font-display text-3xl">
            {step === "credentials" ? "Crea tu cuenta" : "Completa tu perfil"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {step === "credentials"
              ? "Únete a la comunidad de profesionales y clientes"
              : "Solo un momento más"}
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          {step === "credentials" ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Juan García"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="mt-1"
                  data-ocid="register.name.input"
                />
              </div>
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
                  data-ocid="register.email.input"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    data-ocid="register.password.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    data-ocid="register.show_password.toggle"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn || isInitializing}
                data-ocid="register.submit_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <p className="text-sm text-muted-foreground">
                ¿Cómo vas a usar OficiosYa?
              </p>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium text-sm">Soy profesional</p>
                  <p className="text-xs text-muted-foreground">
                    Quiero ofrecer mis servicios
                  </p>
                </div>
                <Switch
                  checked={isWorker}
                  onCheckedChange={setIsWorker}
                  data-ocid="register.worker.switch"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                <div>
                  <p className="font-medium text-sm">Busco servicios</p>
                  <p className="text-xs text-muted-foreground">
                    Quiero contratar profesionales
                  </p>
                </div>
                <Switch
                  checked={isClient}
                  onCheckedChange={setIsClient}
                  data-ocid="register.client.switch"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saveProfile.isPending}
                data-ocid="register.profile.submit_button"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Finalizar registro"
                )}
              </Button>
            </form>
          )}

          {step === "credentials" && (
            <div className="mt-5 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                  data-ocid="register.login.link"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
