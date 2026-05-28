// Telegram WebApp SDK wrapper

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  expand: () => void;
  close: () => void;
  ready: () => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  requestFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const tg = (): TelegramWebApp | undefined =>
  typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

export const isTelegramWebApp = (): boolean => {
  const w = tg();
  return !!(w && w.initData && w.initData.length > 0);
};

export const initTelegram = () => {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
    w.disableVerticalSwipes?.();
    // Sync theme to our dark/light brand
    w.setHeaderColor?.('#1F3A2E');
    w.setBackgroundColor?.('#F5F3EE');
  } catch {
    // no-op
  }
};

export const haptic = {
  light: () => tg()?.HapticFeedback?.impactOccurred('light'),
  medium: () => tg()?.HapticFeedback?.impactOccurred('medium'),
  heavy: () => tg()?.HapticFeedback?.impactOccurred('heavy'),
  success: () => tg()?.HapticFeedback?.notificationOccurred('success'),
  error: () => tg()?.HapticFeedback?.notificationOccurred('error'),
  warning: () => tg()?.HapticFeedback?.notificationOccurred('warning'),
  selection: () => tg()?.HapticFeedback?.selectionChanged(),
};

export const getTelegramUser = (): TelegramUser | undefined =>
  tg()?.initDataUnsafe?.user;
