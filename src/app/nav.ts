import type React from 'react';
import { IconHome } from '@consta/icons/IconHome';
import { IconSearchStroked } from '@consta/icons/IconSearchStroked';
import { IconTable } from '@consta/icons/IconTable';
import { IconCalculator } from '@consta/icons/IconCalculator';
import { IconDocFilled } from '@consta/icons/IconDocFilled';
import { IconFileDocument } from '@consta/icons/IconFileDocument';
import { IconRing } from '@consta/icons/IconRing';
import { IconAllDone } from '@consta/icons/IconAllDone';
import { IconAlert } from '@consta/icons/IconAlert';
import { IconDownload } from '@consta/icons/IconDownload';
import { IconFavoriteStroked } from '@consta/icons/IconFavoriteStroked';
import { IconQuestion } from '@consta/icons/IconQuestion';
import { IconSettings } from '@consta/icons/IconSettings';
import type { RoleCode } from '@/shared/roles';
import { can } from '@/shared/roles';

type IconType = React.ComponentType<{ size?: 's' | 'm' | 'xs'; className?: string }>;

export interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  cap?: Parameters<typeof can>[1];
  badgeKey?: 'signals' | 'tasks';
  aiHint?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Главная',
    items: [
      { to: '/', label: 'Главная', icon: IconSearchStroked },
      { to: '/command-center', label: 'Командный центр', icon: IconHome, cap: 'viewCommandCenter' },
    ],
  },
  {
    title: 'Работа',
    items: [
      { to: '/registry', label: 'Реестр контрагентов', icon: IconTable },
      { to: '/assessments', label: 'Экспресс-оценки', icon: IconCalculator },
      { to: '/limit-requests', label: 'Кредитный лимит', icon: IconDocFilled, cap: 'viewLimitSection' },
      { to: '/protocols', label: 'Протоколы КО', icon: IconFileDocument, cap: 'viewProtocols' },
    ],
  },
  {
    title: 'Внимание',
    items: [
      { to: '/notifications', label: 'Лента сигналов', icon: IconRing, cap: 'viewSignals', badgeKey: 'signals', aiHint: true },
      { to: '/tasks', label: 'Мои задачи', icon: IconAllDone, cap: 'viewTasks', badgeKey: 'tasks' },
      { to: '/subscriptions', label: 'Правила внимания', icon: IconAlert },
    ],
  },
  {
    title: 'Сервисы',
    items: [
      { to: '/reports', label: 'Отчёты и выгрузки', icon: IconDownload },
      { to: '/favorites', label: 'Избранное', icon: IconFavoriteStroked },
      { to: '/help', label: 'Помощь · AI-консультант', icon: IconQuestion, aiHint: true },
    ],
  },
  {
    title: 'Администрирование',
    items: [{ to: '/admin', label: 'Администрирование', icon: IconSettings, cap: 'viewAdmin' }],
  },
];

export function visibleNav(role: RoleCode): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => !it.cap || can(role, it.cap)),
  })).filter((g) => g.items.length > 0);
}
