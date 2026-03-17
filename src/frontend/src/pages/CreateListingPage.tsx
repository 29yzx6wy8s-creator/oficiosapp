import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { ListingForm, type ListingFormData } from "../components/ListingForm";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateListing } from "../hooks/useQueries";

export function CreateListingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createListing = useCreateListing();

  useEffect(() => {
    if (!identity) navigate({ to: "/login" });
  }, [identity, navigate]);

  const handleSubmit = async (data: ListingFormData) => {
    try {
      let mainImageId = "";
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

      await createListing.mutateAsync({
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
      });

      toast.success("¡Anuncio publicado correctamente!");
      navigate({ to: "/profile" });
    } catch {
      toast.error("Error al publicar el anuncio");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        type="button"
        onClick={() => navigate({ to: "/profile" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
        data-ocid="create_listing.back.button"
      >
        <ArrowLeft size={16} />
        Volver al perfil
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl mb-2">Nuevo anuncio</h1>
        <p className="text-muted-foreground mb-8">
          Completa la información para publicar tu servicio
        </p>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <ListingForm
            onSubmit={handleSubmit}
            isSubmitting={createListing.isPending}
            submitLabel="Publicar anuncio"
          />
        </div>
      </motion.div>
    </div>
  );
}
