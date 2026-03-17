import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Category, Filter } from "../backend";
import { ListingCard } from "../components/ListingCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListings } from "../hooks/useQueries";
import {
  ALL_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from "../lib/categories";

export function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [filterCity, setFilterCity] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCategory, setFilterCategory] = useState<Category | "">("");
  const [appliedFilter, setAppliedFilter] = useState<Filter | null>(null);

  const { data: listings = [], isLoading } = useListings(appliedFilter);
  const activeListings = listings.filter((l) => l.active);

  const handleFilter = () => {
    const f: Filter = {};
    if (filterCity.trim()) f.city = filterCity.trim();
    if (filterCountry.trim()) f.country = filterCountry.trim();
    if (filterCategory) f.category = filterCategory as Category;
    setAppliedFilter(Object.keys(f).length ? f : null);
  };

  const handleClear = () => {
    setFilterCity("");
    setFilterCountry("");
    setFilterCategory("");
    setAppliedFilter(null);
  };

  const hasFilters = filterCity || filterCountry || filterCategory;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="/assets/generated/hero-oficios.dim_1400x600.jpg"
          alt="Profesionales de oficios"
          className="w-full h-full object-cover"
        />
        <div className="hero-gradient absolute inset-0" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl text-white mb-3"
          >
            Encuentra el profesional
            <br />
            <em className="not-italic text-accent">que necesitas</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-lg max-w-md"
          >
            Fontaneros, electricistas, pintores y más — sin intermediarios.
          </motion.p>
          {!identity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 flex gap-3"
            >
              <Button
                onClick={() => navigate({ to: "/register" })}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                data-ocid="hero.register.button"
              >
                Publicar mi servicio
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate({ to: "/login" })}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                data-ocid="hero.login.button"
              >
                Iniciar sesión
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-card rounded-xl shadow-card p-4 flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <label
              htmlFor="filter-city"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block"
            >
              Ciudad
            </label>
            <Input
              id="filter-city"
              placeholder="Ej: Madrid, Bogotá..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              data-ocid="filter.city.input"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="filter-country"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block"
            >
              País
            </label>
            <Input
              id="filter-country"
              placeholder="Ej: España, México..."
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              data-ocid="filter.country.input"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor="filter-category"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block"
            >
              Categoría
            </label>
            <Select
              value={filterCategory}
              onValueChange={(v) => setFilterCategory(v as Category | "")}
            >
              <SelectTrigger
                id="filter-category"
                data-ocid="filter.category.select"
              >
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleFilter}
              className="gap-2"
              data-ocid="filter.submit_button"
            >
              <Search size={15} />
              Filtrar
            </Button>
            {hasFilters && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="gap-1"
                data-ocid="filter.clear.button"
              >
                <X size={14} />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Category quick-pills */}
      <section className="container mx-auto px-4 pb-4">
        <div className="flex gap-2 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setAppliedFilter({ category: cat });
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                appliedFilter?.category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
              data-ocid="filter.category.tab"
            >
              {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </section>

      {/* Listings Grid */}
      <section className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="listings.loading_state"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: loading skeleton
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : activeListings.length === 0 ? (
          <div className="text-center py-20" data-ocid="listings.empty_state">
            <p className="text-6xl mb-4">🔍</p>
            <h3 className="font-display text-2xl mb-2">Sin resultados</h3>
            <p className="text-muted-foreground">
              Intenta con otros filtros o sé el primero en publicar en esta
              zona.
            </p>
            {!identity && (
              <Button
                className="mt-4"
                onClick={() => navigate({ to: "/register" })}
                data-ocid="empty.register.button"
              >
                Publicar mi servicio
              </Button>
            )}
          </div>
        ) : (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="listings.list"
          >
            {activeListings.map((listing, i) => (
              <div
                key={listing.id.toString()}
                data-ocid={`listing.item.${i + 1}`}
              >
                <ListingCard listing={listing} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl mb-10">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Busca",
                desc: "Explora miles de profesionales por oficio, ciudad y país. Sin registro.",
              },
              {
                icon: "📩",
                title: "Contacta",
                desc: "Envía un mensaje directo al profesional. Rápido y sin intermediarios.",
              },
              {
                icon: "✅",
                title: "Contrata",
                desc: "Acuerda el trabajo directamente. Sin comisiones ocultas.",
              },
            ].map((step) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow-card"
              >
                <p className="text-4xl mb-3">{step.icon}</p>
                <h3 className="font-display text-xl mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
