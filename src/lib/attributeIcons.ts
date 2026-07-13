import {
  Ruler,
  Palette,
  Layers,
  Sofa,
  Armchair,
  Bed,
  Leaf,
  Weight,
  Wind,
  Droplet,
  Flame,
  Blocks,
  Sun,
  Zap,
  Lamp,
  DoorOpen,
  Table2,
  Loader,
  Feather,
  Star,
  ChevronsUpDown,
  Move3d,
  type LucideIcon,
} from 'lucide-react';

export interface AttributeIconDef {
  key: string;
  label: string; // UZ display
  Icon: LucideIcon;
}

// Furniture-focused icon set
export const ATTRIBUTE_ICONS: AttributeIconDef[] = [
  { key: 'ruler', label: "O'lcham", Icon: Ruler },
  { key: 'move3d', label: 'Hajm', Icon: Move3d },
  { key: 'weight', label: 'Og\'irlik', Icon: Weight },
  { key: 'palette', label: 'Rang', Icon: Palette },
  { key: 'layers', label: 'Material', Icon: Layers },
  { key: 'feather', label: 'To\'ldirgich', Icon: Feather },
  { key: 'sofa', label: 'Divan', Icon: Sofa },
  { key: 'armchair', label: 'Kreslo', Icon: Armchair },
  { key: 'bed', label: 'Yotoq', Icon: Bed },
  { key: 'table', label: 'Stol', Icon: Table2 },
  { key: 'door', label: 'Eshik/Ochilish', Icon: DoorOpen },
  { key: 'blocks', label: 'Karkas', Icon: Blocks },
  { key: 'leaf', label: 'Ekologik', Icon: Leaf },
  { key: 'droplet', label: 'Namlik', Icon: Droplet },
  { key: 'flame', label: 'Yong\'inbardosh', Icon: Flame },
  { key: 'wind', label: 'Nafas oluvchan', Icon: Wind },
  { key: 'sun', label: 'UV himoya', Icon: Sun },
  { key: 'zap', label: 'Elektr', Icon: Zap },
  { key: 'lamp', label: 'Yorug\'lik', Icon: Lamp },
  { key: 'chevrons', label: 'Balandlik', Icon: ChevronsUpDown },
  { key: 'loader', label: 'Yuklama', Icon: Loader },
];

export const ATTRIBUTE_ICON_MAP: Record<string, LucideIcon> = ATTRIBUTE_ICONS.reduce(
  (acc, i) => ({ ...acc, [i.key]: i.Icon }),
  {}
);

export function getAttributeIcon(key: string | undefined | null): LucideIcon {
  if (!key) return Star;
  return ATTRIBUTE_ICON_MAP[key] || Star;
}
