import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { RoleCode } from '@/shared/roles';

/* Глобальный UI-контекст прототипа: роль, AI on/off, тема, командная палитра.
   Реальное приложение держит роль в слайсе `auth` из JWT (08/разд. 2);
   здесь — переключатель для демонстрации одного продукта для 8 ролей. */

type ThemeMode = 'light' | 'dark';
/* Скин-вариант оформления: «pmrk» — родной дизайн, «sfk» — полное визуальное
   повторение портала СФК (тот же контент/маршруты, другой визуальный язык). */
type Skin = 'pmrk' | 'sfk';

interface AppState {
  role: RoleCode;
  setRole: (r: RoleCode) => void;
  aiOn: boolean;
  setAiOn: (v: boolean) => void;
  toggleAi: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  skin: Skin;
  setSkin: (s: Skin) => void;
  toggleSkin: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

const LS_ROLE = 'pmrk.role';
const LS_AI = 'pmrk.ai';
const LS_THEME = 'pmrk.theme';
const LS_SKIN = 'pmrk.skin';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<RoleCode>(() => (localStorage.getItem(LS_ROLE) as RoleCode) || 'КК-ДО');
  const [aiOn, setAiOn] = useState<boolean>(() => localStorage.getItem(LS_AI) !== 'off');
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem(LS_THEME) as ThemeMode) || 'light');
  const [skin, setSkin] = useState<Skin>(() => (localStorage.getItem(LS_SKIN) as Skin) || 'pmrk');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => localStorage.setItem(LS_ROLE, role), [role]);
  useEffect(() => localStorage.setItem(LS_AI, aiOn ? 'on' : 'off'), [aiOn]);
  useEffect(() => localStorage.setItem(LS_THEME, theme), [theme]);
  // Скин управляется атрибутом data-skin на <html> — на него вешается весь
  // слой стилей СФК (skin-sfk.css). Параллельно с тем, как Consta-пресет даёт тему.
  useEffect(() => {
    localStorage.setItem(LS_SKIN, skin);
    document.documentElement.setAttribute('data-skin', skin);
  }, [skin]);

  // Cmd/Ctrl-K — основной способ навигации и действий
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      role,
      setRole,
      aiOn,
      setAiOn,
      toggleAi: () => setAiOn((v) => !v),
      theme,
      setTheme,
      skin,
      setSkin,
      toggleSkin: () => setSkin((s) => (s === 'pmrk' ? 'sfk' : 'pmrk')),
      paletteOpen,
      setPaletteOpen,
    }),
    [role, aiOn, theme, skin, paletteOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
