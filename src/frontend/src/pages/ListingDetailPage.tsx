import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  MessageSquare,
  ShoppingCart,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { StarRating } from "../components/StarRating";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddRating,
  useAverageRating,
  useCreateCheckoutSession,
  useListing,
  useRatings,
} from "../hooks/useQueries";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../lib/categories";

export function ListingDetailPage() {
  const { id } = useParams({ from: "/listing/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const listingId = BigInt(id);

  const { data: listing, isLoading } = useListing(listingId);
  const { data: avgRating = 0 } = useAverageRating(listingId);
  const { data: ratings = [] } = useRatings(listingId);
  const addRating = useAddRating();
  const createCheckout = useCreateCheckoutSession();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const isOwner =
    identity &&
    listing &&
    identity.getPrincipal().toString() === listing.owner.toString();

  const canHire = !!identity && !!listing && !isOwner;

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10"
        data-ocid="listing.loading_state"
      >
        <Skeleton className="h-80 rounded-xl mb-6" />
        <Skeleton className="h-8 w-2/3 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="listing.error_state"
      >
        <p className="text-5xl mb-4">😔</p>
        <h2 className="font-display text-2xl mb-2">Anuncio no encontrado</h2>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/" })}
          className="mt-4"
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  const handleMessage = () => {
    if (!identity) {
      navigate({ to: "/login" });
    } else {
      navigate({
        to: "/messages/$userId",
        params: { userId: listing.owner.toString() },
      });
    }
  };

  const handleHire = async () => {
    if (!identity) {
      navigate({ to: "/login" });
      return;
    }
    try {
      const successUrl = `${window.location.origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/?payment=cancelled`;
      const checkoutUrl = await createCheckout.mutateAsync({
        listingId,
        successUrl,
        cancelUrl,
      });
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Error al iniciar el pago. Intenta de nuevo.");
    }
  };

  const handleSubmitReview = async () => {
    if (!identity) {
      navigate({ to: "/login" });
      return;
    }
    try {
      await addRating.mutateAsync({
        listingId,
        rating: BigInt(reviewRating),
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
      toast.success("Reseña enviada correctamente");
    } catch {
      toast.error("Error al enviar la reseña");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors"
        data-ocid="listing.back.button"
      >
        <ArrowLeft size={16} />
        Volver al listado
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Main image */}
        <div className="rounded-2xl overflow-hidden h-72 md:h-96 mb-6 bg-muted">
          {listing.mainImageId ? (
            <img
              src={listing.mainImageId}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-8xl opacity-30">
                {CATEGORY_ICONS[listing.category]}
              </span>
            </div>
          )}
        </div>

        {/* Additional images */}
        {listing.additionalImageIds.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {listing.additionalImageIds.map((blob, i) => (
              <img
                // biome-ignore lint/suspicious/noArrayIndexKey: additional images are positional
                key={i}
                src={blob.getDirectURL()}
                alt={`Foto ${i + 1}`}
                className="h-24 w-24 rounded-lg object-cover flex-shrink-0"
              />
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left col */}
          <div className="md:col-span-2">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {CATEGORY_ICONS[listing.category]}{" "}
                  {CATEGORY_LABELS[listing.category]}
                </Badge>
                <h1 className="font-display text-3xl">
                  {listing.professionalName}
                </h1>
                <p className="text-muted-foreground">{listing.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <StarRating value={avgRating} size="lg" />
                <span className="text-lg font-semibold">
                  {avgRating > 0 ? avgRating.toFixed(1) : "Nuevo"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mb-6">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin size={15} />
                {listing.city}, {listing.country}
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock size={15} />
                {Number(listing.experienceYears)} años de experiencia
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-accent-foreground">
                <DollarSign size={15} className="text-accent" />
                {listing.price}
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border mb-6">
              <h2 className="font-display text-lg mb-3">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="font-display text-xl mb-4">
                Reseñas ({ratings.length})
              </h2>
              {ratings.length === 0 ? (
                <p
                  className="text-muted-foreground text-sm mb-6"
                  data-ocid="reviews.empty_state"
                >
                  Aún no hay reseñas. ¡Sé el primero!
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {ratings.map((r, i) => (
                    <div
                      key={r.id.toString()}
                      className="bg-card rounded-lg p-4 border border-border"
                      data-ocid={`review.item.${i + 1}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <StarRating value={Number(r.rating)} size="sm" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            Number(r.timestamp) / 1_000_000,
                          ).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Write review */}
              <div className="bg-secondary rounded-xl p-5">
                <h3 className="font-semibold mb-3 text-sm">Dejar una reseña</h3>
                <div className="mb-3">
                  <StarRating
                    value={reviewRating}
                    size="lg"
                    interactive
                    onChange={setReviewRating}
                  />
                </div>
                <Textarea
                  placeholder="Cuéntanos tu experiencia..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mb-3"
                  data-ocid="review.textarea"
                />
                <Button
                  onClick={handleSubmitReview}
                  disabled={addRating.isPending}
                  size="sm"
                  data-ocid="review.submit_button"
                >
                  <Star size={14} className="mr-1.5" />
                  Enviar reseña
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-card rounded-xl p-5 border border-border sticky top-20 space-y-3">
              <h3 className="font-semibold mb-1">Contactar profesional</h3>

              {/* Hire / Pay button - only for logged-in non-owners */}
              {canHire && (
                <Button
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  onClick={handleHire}
                  disabled={createCheckout.isPending}
                  data-ocid="payment.primary_button"
                >
                  {createCheckout.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span data-ocid="payment.loading_state">
                        Procesando...
                      </span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Contratar y Pagar
                    </>
                  )}
                </Button>
              )}

              <Button
                className="w-full gap-2"
                variant={canHire ? "outline" : "default"}
                onClick={handleMessage}
                data-ocid="listing.contact.button"
              >
                <MessageSquare size={16} />
                Enviar mensaje
              </Button>

              {!identity && (
                <p className="text-xs text-muted-foreground text-center">
                  Inicia sesión para contactar o contratar
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
