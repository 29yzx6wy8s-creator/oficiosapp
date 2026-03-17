import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { ListingForm, type ListingFormData } from "../components/ListingForm";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListing, useUpdateListing } from "../hooks/useQueries";

export function EditListingPage() {
  const { id } = useParams({ from: "/listings/$id/edit" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const listingId = BigInt(id);
  const { data: listing, isLoading } = useListing(listingId);
  const updateListing = useUpdateListing();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleSubmit = async (data: ListingFormData) => {
    try {
      let mainImageId = listing?.mainImageId || "";
      if (data.mainImageFile) {
        const bytes = new Uint8Array(await data.mainImageFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        mainImageId = blob.getDirectURL();
      }

      const additionalBlobs: ExternalBlob[] = await Promise.all(
        data.additionalImageFiles.map(async (file) => {
          const bytes = new Uint8Array(await file.arrayBuffer());
          return ExternalBlob.fromBytes(bytes);
        }),
      );

      await updateListing.mutateAsync({
        id: listingId,
        title: data.title,
        description: data.description,
        category: data.category,
        city: data.city,
        country: data.country,
        price: data.price,
        experienceYears: BigInt(data.experienceYears),
        mainImageId,
        additionalImageIds: additionalBlobs,
        professionalName: data.professionalName,
        active: data.active !== undefined ? data.active : true,
      });

      toast.success("Anuncio actualizado");
      navigate({ to: "/profile" });
    } catch {
      toast.error("Error al actualizar el anuncio");
    }
  };

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-10 max-w-2xl"
        data-ocid="edit_listing.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="edit_listing.error_state"
      >
        <p className="text-muted-foreground">Anuncio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        type="button"
        onClick={() => navigate({ to: "/profile" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        data-ocid="edit_listing.back.button"
      >
        <ArrowLeft size={16} />
        Volver al perfil
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl mb-2">Editar anuncio</h1>
        <p className="text-muted-foreground mb-8">
          Actualiza la información de tu servicio
        </p>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <ListingForm
            initialData={{
              title: listing.title,
              description: listing.description,
              category: listing.category,
              city: listing.city,
              country: listing.country,
              price: listing.price,
              experienceYears: Number(listing.experienceYears),
              professionalName: listing.professionalName,
              active: listing.active,
              mainImageUrl: listing.mainImageId,
            }}
            onSubmit={handleSubmit}
            isSubmitting={updateListing.isPending}
            submitLabel="Guardar cambios"
            showActive
          />
        </div>
      </motion.div>
    </div>
  );
}
