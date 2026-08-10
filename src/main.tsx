import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Theme, presetGpnDefault, presetGpnDark } from '@consta/uikit/Theme';
import { AppProvider, useApp } from './app/AppContext';
import { router } from './app/router';
import './app/theme.css';
import './app/shell.css';
import './app/skin-sfk.css';

function Root() {
  const { theme } = useApp();
  return (
    <Theme preset={theme === 'dark' ? presetGpnDark : presetGpnDefault} style={{ height: '100%' }}>
      <RouterProvider router={router} />
    </Theme>
  );
}

const container = document.getElementById('root')!;
// Кэшируем root, чтобы HMR не пересоздавал его (иначе warning createRoot)
const w = window as unknown as { __pmrkRoot?: ReturnType<typeof createRoot> };
const root = w.__pmrkRoot ?? createRoot(container);
w.__pmrkRoot = root;
root.render(
  <React.StrictMode>
    <AppProvider>
      <Root />
    </AppProvider>
  </React.StrictMode>,
);
