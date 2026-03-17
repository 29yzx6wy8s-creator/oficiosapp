import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCallerProfile,
  useDeleteListing,
  useListings,
  useMyPayments,
  useSaveProfile,
} from "../hooks/useQueries";
import type { PaymentData } from "../hooks/useQueries";
import { CATEGORY_LABELS } from "../lib/categories";

function formatCOP(amount: bigint): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function PaymentStatusBadge({ status }: { status: PaymentData["status"] }) {
  if (status.__kind__ === "completed") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        Completado
      </Badge>
    );
  }
  if (status.__kind__ === "failed") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        Fallido
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
      Pendiente
    </Badge>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: allListings = [], isLoading: listingsLoading } =
    useListings(null);
  const saveProfile = useSaveProfile();
  const deleteListing = useDeleteListing();
  const { data: myPayments = [], isLoading: paymentsLoading } = useMyPayments();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isWorker, setIsWorker] = useState(false);
  const [isClient, setIsClient] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setIsWorker(profile.isWorker);
      setIsClient(profile.isClient);
    }
  }, [profile]);

  const myListings = allListings.filter(
    (l) => l.owner.toString() === identity?.getPrincipal().toString(),
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync({ name, email, isWorker, isClient });
      setEditing(false);
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al guardar el perfil");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteListing.mutateAsync(id);
      toast.success("Anuncio eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  if (profileLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10 max-w-2xl"
        data-ocid="profile.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl">Mi Perfil</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing((v) => !v)}
            data-ocid="profile.edit.button"
          >
            <Pencil size={14} className="mr-1.5" />
            {editing ? "Cancelar" : "Editar"}
          </Button>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-card mb-8">
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="pname">Nombre</Label>
                <Input
                  id="pname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  data-ocid="profile.name.input"
                />
              </div>
              <div>
                <Label htmlFor="pemail">Email</Label>
                <Input
                  id="pemail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  data-ocid="profile.email.input"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <span className="text-sm font-medium">Soy profesional</span>
                <Switch
                  checked={isWorker}
                  onCheckedChange={setIsWorker}
                  data-ocid="profile.worker.switch"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <span className="text-sm font-medium">Busco servicios</span>
                <Switch
                  checked={isClient}
                  onCheckedChange={setIsClient}
                  data-ocid="profile.client.switch"
                />
              </div>
              <Button
                type="submit"
                disabled={saveProfile.isPending}
                data-ocid="profile.save.button"
              >
                {saveProfile.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Nombre
                </p>
                <p className="font-medium">{profile?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email
                </p>
                <p className="font-medium">{profile?.email || "—"}</p>
              </div>
              <div className="flex gap-3 pt-1">
                {profile?.isWorker && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    Profesional
                  </span>
                )}
                {profile?.isClient && (
                  <span className="text-xs bg-accent/10 text-accent-foreground px-2.5 py-1 rounded-full">
                    Cliente
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="listings">
          <TabsList className="mb-4">
            <TabsTrigger value="listings" data-ocid="profile.listings.tab">
              Mis anuncios
            </TabsTrigger>
            <TabsTrigger value="payments" data-ocid="payment.tab">
              Mis Pagos
            </TabsTrigger>
          </TabsList>

          {/* Listings tab */}
          <TabsContent value="listings">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl">
                Mis anuncios ({myListings.length})
              </h2>
              <Button asChild size="sm" data-ocid="profile.create.button">
                <Link to="/listings/new">
                  <Plus size={14} className="mr-1.5" />
                  Nuevo anuncio
                </Link>
              </Button>
            </div>

            {listingsLoading ? (
              <Skeleton
                className="h-32 rounded-xl"
                data-ocid="profile.listings.loading_state"
              />
            ) : myListings.length === 0 ? (
              <div
                className="text-center py-10 bg-secondary rounded-xl"
                data-ocid="profile.listings.empty_state"
              >
                <p className="text-4xl mb-2">📋</p>
                <p className="text-muted-foreground text-sm">
                  Aún no has publicado ningún anuncio
                </p>
                <Button
                  asChild
                  className="mt-3"
                  size="sm"
                  data-ocid="profile.first_listing.button"
                >
                  <Link to="/listings/new">Crear mi primer anuncio</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="profile.listings.list">
                {myListings.map((listing, i) => (
                  <div
                    key={listing.id.toString()}
                    className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                    data-ocid={`profile.listing.item.${i + 1}`}
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {listing.mainImageId ? (
                        <img
                          src={listing.mainImageId}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🛠️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{listing.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{CATEGORY_LABELS[listing.category]}</span>
                        <span>·</span>
                        <MapPin size={11} />
                        <span>{listing.city}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          listing.active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {listing.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        data-ocid={`profile.listing.edit_button.${i + 1}`}
                      >
                        <Link
                          to="/listings/$id/edit"
                          params={{ id: listing.id.toString() }}
                        >
                          <Pencil size={14} />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            data-ocid={`profile.listing.delete_button.${i + 1}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="profile.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar anuncio?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="profile.delete.cancel_button">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(listing.id)}
                              className="bg-destructive"
                              data-ocid="profile.delete.confirm_button"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payments tab */}
          <TabsContent value="payments">
            <h2 className="font-display text-xl mb-4">Mis Pagos</h2>
            {paymentsLoading ? (
              <div className="space-y-3" data-ocid="payment.loading_state">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
              </div>
            ) : myPayments.length === 0 ? (
              <div
                className="text-center py-12 bg-secondary rounded-xl"
                data-ocid="payment.empty_state"
              >
                <p className="text-4xl mb-2">💳</p>
                <p className="text-muted-foreground text-sm">
                  Aún no has realizado ningún pago
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="payment.list">
                {myPayments.map((payment, i) => (
                  <div
                    key={payment.id.toString()}
                    className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border"
                    data-ocid={`payment.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {payment.listingTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.professionalName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(
                          Number(payment.timestamp) / 1_000_000,
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      <p className="font-bold text-sm">
                        {formatCOP(payment.amountCOP)}
                      </p>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
