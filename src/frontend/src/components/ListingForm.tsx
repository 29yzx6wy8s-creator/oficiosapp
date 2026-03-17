import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Category } from "../backend";
import {
  ALL_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from "../lib/categories";

export interface ListingFormData {
  title: string;
  description: string;
  category: Category;
  city: string;
  country: string;
  price: string;
  experienceYears: number;
  professionalName: string;
  mainImageFile: File | null;
  additionalImageFiles: File[];
  active?: boolean;
}

interface ListingFormProps {
  initialData?: Partial<ListingFormData> & { mainImageUrl?: string };
  onSubmit: (data: ListingFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  showActive?: boolean;
}

export function ListingForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Publicar",
  showActive = false,
}: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [category, setCategory] = useState<Category>(
    initialData?.category || Category.plumbing,
  );
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [experienceYears, setExperienceYears] = useState(
    initialData?.experienceYears || 0,
  );
  const [professionalName, setProfessionalName] = useState(
    initialData?.professionalName || "",
  );
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true,
  );
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState(
    initialData?.mainImageUrl || "",
  );
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeAdditional = (i: number) => {
    setAdditionalFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      category,
      city,
      country,
      price,
      experienceYears,
      professionalName,
      mainImageFile,
      additionalImageFiles: additionalFiles,
      active,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="profesionalName">Nombre del profesional *</Label>
          <Input
            id="profesionalName"
            value={professionalName}
            onChange={(e) => setProfessionalName(e.target.value)}
            required
            placeholder="Tu nombre o nombre del negocio"
            className="mt-1"
            data-ocid="listing_form.name.input"
          />
        </div>
        <div>
          <Label htmlFor="title">Título del servicio *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Instalación y reparación de tuberías"
            className="mt-1"
            data-ocid="listing_form.title.input"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe tus servicios, experiencia y especialidades..."
          rows={4}
          className="mt-1"
          data-ocid="listing_form.description.textarea"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <Label htmlFor="category-select">Categoría *</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <SelectTrigger
              id="category-select"
              className="mt-1"
              data-ocid="listing_form.category.select"
            >
              <SelectValue />
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
        <div>
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="Ej: Barcelona"
            className="mt-1"
            data-ocid="listing_form.city.input"
          />
        </div>
        <div>
          <Label htmlFor="country">País *</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            placeholder="Ej: España"
            className="mt-1"
            data-ocid="listing_form.country.input"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="price">Precio / Tarifa</Label>
          <Input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ej: 30€/hora, Consultar, Desde 50€"
            className="mt-1"
            data-ocid="listing_form.price.input"
          />
        </div>
        <div>
          <Label htmlFor="experience">Años de experiencia</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={50}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="mt-1"
            data-ocid="listing_form.experience.input"
          />
        </div>
      </div>

      {/* Main image */}
      <div>
        <Label>Imagen principal</Label>
        <div className="mt-1">
          {mainImagePreview ? (
            <div className="relative w-48 h-48 rounded-xl overflow-hidden">
              <img
                src={mainImagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setMainImageFile(null);
                  setMainImagePreview("");
                }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                data-ocid="listing_form.remove_main_image.button"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => mainInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors text-sm text-muted-foreground"
              data-ocid="listing_form.upload_button"
            >
              <Upload size={16} />
              Subir imagen principal
            </button>
          )}
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            onChange={handleMainImage}
            className="hidden"
          />
        </div>
      </div>

      {/* Additional images */}
      <div>
        <Label>Fotos adicionales (máx. 5)</Label>
        <div className="mt-1 flex flex-wrap gap-3">
          {additionalFiles.map((file, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: file list is positionally managed
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Adicional ${i}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeAdditional(i)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                data-ocid={`listing_form.remove_additional.button.${i + 1}`}
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          ))}
          {additionalFiles.length < 5 && (
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary transition-colors"
              data-ocid="listing_form.add_photos.button"
            >
              <Upload size={18} />
            </button>
          )}
        </div>
        <input
          ref={addInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImages}
          className="hidden"
        />
      </div>

      {showActive && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
          <div>
            <p className="font-medium text-sm">Anuncio activo</p>
            <p className="text-xs text-muted-foreground">
              Desactiva para ocultarlo temporalmente
            </p>
          </div>
          <Switch
            checked={active}
            onCheckedChange={setActive}
            data-ocid="listing_form.active.switch"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
        data-ocid="listing_form.submit_button"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
