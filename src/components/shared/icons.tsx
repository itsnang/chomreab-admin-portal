import type { LucideProps } from "lucide-react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Compass,
  Heart,
  MapPin,
  Minus,
  Package,
  Plus,
  QrCode,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";

export type IconProps = LucideProps;

export const Icons = {
  check: (props: IconProps) => <Check {...props} />,
  chevronDown: (props: IconProps) => <ChevronDown {...props} />,
  chevronRight: (props: IconProps) => <ChevronRight {...props} />,
  chevronUp: (props: IconProps) => <ChevronUp {...props} />,
  clock: (props: IconProps) => <Clock {...props} />,
  compass: (props: IconProps) => <Compass {...props} />,
  heart: (props: IconProps) => <Heart {...props} />,
  mapPin: (props: IconProps) => <MapPin {...props} />,
  minus: (props: IconProps) => <Minus {...props} />,
  package: (props: IconProps) => <Package {...props} />,
  phone: (props: IconProps) => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 5c0 9 6 15 15 15a2 2 0 0 0 2-2v-2.5a1 1 0 0 0-.8-1l-3.4-.7a1 1 0 0 0-1 .4l-1 1.3a12 12 0 0 1-5-5l1.3-1a1 1 0 0 0 .4-1L10.5 5.8a1 1 0 0 0-1-.8H6a2 2 0 0 0-2 2z" />
    </svg>
  ),
  plus: (props: IconProps) => <Plus {...props} />,
  qrCode: (props: IconProps) => <QrCode {...props} />,
  shoppingBag: (props: IconProps) => <ShoppingBag {...props} />,
  trash2: (props: IconProps) => <Trash2 {...props} />,
  user: (props: IconProps) => <User {...props} />,
  x: (props: IconProps) => <X {...props} />,
};
