import {
  Zap, Star, Flame, Briefcase, Sofa, Sparkles, Heart, Award, Tag,
  Gift, Crown, Truck, ShieldCheck, Percent, Bed, Armchair, Lamp,
  UtensilsCrossed, Package, ShoppingBag, type LucideIcon,
} from 'lucide-react';

export const PROMO_ICONS: Record<string, LucideIcon> = {
  Zap, Star, Flame, Briefcase, Sofa, Sparkles, Heart, Award, Tag,
  Gift, Crown, Truck, ShieldCheck, Percent, Bed, Armchair, Lamp,
  UtensilsCrossed, Package, ShoppingBag,
};

export const PROMO_ICON_NAMES = Object.keys(PROMO_ICONS);

export const BG_PRESETS: { label: string; bg: string; text: string }[] = [
  { label: 'Mint (yashil)', bg: 'bg-[#D4EDE0]', text: 'text-foreground' },
  { label: 'Krem (bej)', bg: 'bg-[#F0E0CC]', text: 'text-foreground' },
  { label: 'Pushti', bg: 'bg-[#F5D5D0]', text: 'text-foreground' },
  { label: "To'q yashil", bg: 'bg-[#1F3A2E]', text: 'text-white' },
  { label: 'Och bej', bg: 'bg-[#E8D4B8]', text: 'text-foreground' },
  { label: 'Havorang', bg: 'bg-[#D0E0F0]', text: 'text-foreground' },
  { label: 'Lavanda', bg: 'bg-[#E0D5F0]', text: 'text-foreground' },
  { label: "To'q kulrang", bg: 'bg-[#2D2D2D]', text: 'text-white' },
];
