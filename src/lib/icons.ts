import {
  BabyIcon,
  BanknoteIcon,
  BusIcon,
  CarIcon,
  CircleIcon,
  CoinsIcon,
  CreditCardIcon,
  DropletIcon,
  DumbbellIcon,
  FlameIcon,
  FuelIcon,
  Gamepad2Icon,
  GiftIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HouseIcon,
  LandmarkIcon,
  LightbulbIcon,
  PawPrintIcon,
  PhoneIcon,
  PiggyBankIcon,
  PillIcon,
  PlaneIcon,
  ReceiptIcon,
  RepeatIcon,
  ShieldIcon,
  ShirtIcon,
  ShoppingCartIcon,
  StethoscopeIcon,
  TagIcon,
  TvIcon,
  UtensilsIcon,
  WalletIcon,
  WifiIcon,
  ZapIcon,
} from '@lucide/vue'
import type { Component } from 'vue'
import type { AccountType } from '@/types'

/**
 * Set curato di icone selezionabili (chiave kebab-case salvata nel DB).
 * Insieme esplicito invece della risoluzione dinamica: bundle prevedibile
 * e nessuna icona "rotta" se il nome non esiste.
 */
export const ICONS: Record<string, Component> = {
  wallet: WalletIcon,
  'credit-card': CreditCardIcon,
  banknote: BanknoteIcon,
  landmark: LandmarkIcon,
  'piggy-bank': PiggyBankIcon,
  coins: CoinsIcon,
  receipt: ReceiptIcon,
  'shopping-cart': ShoppingCartIcon,
  utensils: UtensilsIcon,
  house: HouseIcon,
  car: CarIcon,
  fuel: FuelIcon,
  bus: BusIcon,
  plane: PlaneIcon,
  shield: ShieldIcon,
  zap: ZapIcon,
  flame: FlameIcon,
  droplet: DropletIcon,
  lightbulb: LightbulbIcon,
  wifi: WifiIcon,
  phone: PhoneIcon,
  tv: TvIcon,
  'heart-pulse': HeartPulseIcon,
  stethoscope: StethoscopeIcon,
  pill: PillIcon,
  dumbbell: DumbbellIcon,
  gamepad: Gamepad2Icon,
  gift: GiftIcon,
  'graduation-cap': GraduationCapIcon,
  baby: BabyIcon,
  shirt: ShirtIcon,
  'paw-print': PawPrintIcon,
  repeat: RepeatIcon,
  tag: TagIcon,
}

export const ICON_NAMES = Object.keys(ICONS)

export const DEFAULT_CATEGORY_ICON = 'tag'
export const DEFAULT_ACCOUNT_ICON = 'wallet'

export function getIconComponent(name?: string | null): Component {
  if (name && ICONS[name]) return ICONS[name]
  return CircleIcon
}

/** Icona suggerita per ciascun tipo di conto. */
export const ACCOUNT_TYPE_ICON: Record<AccountType, string> = {
  conto_corrente: 'landmark',
  carta: 'credit-card',
  bancomat: 'wallet',
  contanti: 'banknote',
}
