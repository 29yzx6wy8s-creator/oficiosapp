import { Category } from "../backend";

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.plumbing]: "Fontanería",
  [Category.electricity]: "Electricidad",
  [Category.masonry]: "Albañilería",
  [Category.painting]: "Pintura",
  [Category.carpentry]: "Carpintería",
  [Category.hvac]: "Climatización",
  [Category.gardening]: "Jardinería",
  [Category.cleaning]: "Limpieza",
  [Category.renovations]: "Reformas",
  [Category.locksmith]: "Cerrajería",
  [Category.moving]: "Mudanzas",
  [Category.other]: "Otros",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  [Category.plumbing]: "🔧",
  [Category.electricity]: "⚡",
  [Category.masonry]: "🧱",
  [Category.painting]: "🎨",
  [Category.carpentry]: "🪚",
  [Category.hvac]: "❄️",
  [Category.gardening]: "🌿",
  [Category.cleaning]: "🧹",
  [Category.renovations]: "🏗️",
  [Category.locksmith]: "🔐",
  [Category.moving]: "📦",
  [Category.other]: "🛠️",
};

export const ALL_CATEGORIES = Object.values(Category);
