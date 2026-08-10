import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearchStroked } from '@consta/icons/IconSearchStroked';
import { useApp } from './AppContext';
import { visibleNav } from './nav';
import { REGISTRY } from '@/shared/mock/data';
import { GroupBadge } from '@/shared/ui/kit';

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
  badge?: React.ReactNode;
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, role, aiOn } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paletteOpen) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [paletteOpen]);

  const go = (to: string) => {
    navigate(to);
    setPaletteOpen(false);
  };

  const commands = useMemo<Cmd[]>(() => {
    const actions: Cmd[] = [
      { id: 'a-assess', label: 'Новая экспресс-оценка', hint: 'Создать', group: 'Действия', run: () => go('/assessments/new') },
      { id: 'a-limit', label: 'Создать заявку на кредитный лимит', hint: 'Создать', group: 'Действия', run: () => go('/limit-requests/new') },
      { id: 'a-advance', label: 'Расчёт лимита авансирования', hint: 'Создать', group: 'Действия', run: () => go('/assessments/new?direction=ADVANCE') },
      { id: 'a-report', label: 'Запросить отчёт «Профиль контрагента»', hint: 'Отчёт', group: 'Действия', run: () => go('/reports') },
      { id: 'a-mass', label: 'Массовая экспресс-оценка', hint: 'Выгрузка', group: 'Действия', run: () => go('/assessments/mass') },
    ];
    const nav: Cmd[] = visibleNav(role).flatMap((g) =>
      g.items.map((it) => ({ id: `n-${it.to}`, label: it.label, hint: 'Перейти', group: 'Навигация', run: () => go(it.to) })),
    );
    return [...actions, ...nav];
  }, [role]);

  const query = q.trim().toLowerCase();
  const isInnLike = /^\d{3,}$/.test(query);

  const cpMatches = useMemo(() => {
    if (query.length < 2) return [];
    return REGISTRY.filter((c) => (isInnLike ? c.inn.includes(query) : c.name.toLowerCase().includes(query) || c.inn.includes(query))).slice(0, 12);
  }, [query, isInnLike]);

  const filteredCmds = query
    ? commands.filter((c) => c.label.toLowerCase().includes(query) || c.group.toLowerCase().includes(query))
    : commands;

  // Сборка плоского списка для навигации стрелками
  const flat: Cmd[] = [
    ...(aiOn && query ? [{ id: 'ai-ask', label: `Спросить AI: «${q}»`, hint: '✦ AI', group: 'AI', run: () => go('/help?q=' + encodeURIComponent(q)) } as Cmd] : []),
    ...cpMatches.map<Cmd>((c) => ({
      id: 'cp-' + c.uid,
      label: c.name,
      hint: `ИНН ${c.inn}`,
      group: 'Контрагенты',
      badge: <GroupBadge group={c.group} />,
      run: () => go(`/counterparties/${c.uid}`),
    })),
    ...filteredCmds,
  ];

  useEffect(() => setActive(0), [q]);

  if (!paletteOpen) return null;

  const groups = Array.from(new Set(flat.map((c) => c.group)));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(flat.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flat[active]?.run();
    } else if (e.key === 'Escape') {
      setPaletteOpen(false);
    }
  };

  let idx = -1;
  return (
    <div className="pmrk-palette__overlay" onClick={() => setPaletteOpen(false)}>
      <div className="pmrk-palette pmrk-enter" onClick={(e) => e.stopPropagation()}>
        <div className="pmrk-palette__input">
          <IconSearchStroked size="s" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Поиск контрагента по ИНН/наименованию, действие или раздел…"
          />
        </div>

        <div className="pmrk-palette__list">
          {flat.length === 0 && (
            <div style={{ padding: 20, color: 'var(--color-typo-secondary)', fontSize: 14 }}>
              Ничего не найдено.{' '}
              {isInnLike && (
                <a href="#" onClick={(e) => { e.preventDefault(); go('/counterparties/request?q=' + encodeURIComponent(q.trim())); }} style={{ color: 'var(--color-typo-brand)' }}>
                  Создать карточку по ИНН {q}
                </a>
              )}
            </div>
          )}
          {groups.map((g) => (
            <div key={g}>
              <div className="pmrk-palette__group">{g}</div>
              {flat
                .filter((c) => c.group === g)
                .map((c) => {
                  idx++;
                  const myIdx = idx;
                  return (
                    <div
                      key={c.id}
                      className={`pmrk-palette__item ${myIdx === active ? 'pmrk-palette__item--active' : ''}`}
                      onMouseEnter={() => setActive(myIdx)}
                      onClick={c.run}
                    >
                      <span>{c.label}</span>
                      {c.badge}
                      <span className="pmrk-palette__hint">{c.hint}</span>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        <div className="pmrk-palette__foot">
          <span>↑↓ — выбор</span>
          <span>↵ — открыть</span>
          <span>Esc — закрыть</span>
          <span style={{ marginLeft: 'auto' }}>История: 10 последних · подсказки ≤ 20</span>
        </div>
      </div>
    </div>
  );
}
