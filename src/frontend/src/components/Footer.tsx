import { Wrench } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Wrench size={14} className="text-primary-foreground" />
            </div>
            <span className="font-display text-lg">OficiosYa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {year}. Construido con ❤️ usando{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Conectando profesionales con clientes
          </p>
        </div>
      </div>
    </footer>
  );
}
