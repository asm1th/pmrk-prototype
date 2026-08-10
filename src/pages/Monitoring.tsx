import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { useApp } from '@/app/AppContext';
import { PageHeader, SectionCard, GroupBadge, EmptyState, severityColor, SEVERITY_LABEL, Segmented } from '@/shared/ui/kit';
import { TaskRow } from '@/shared/ui/TaskRow';
import { SIGNALS, TASKS, BY_UID } from '@/shared/mock/data';
import type { SignalSeverity } from '@/shared/mock/types';
import { ago, moneyCompact } from '@/shared/format';

/* ----------------------------- Лента сигналов ----------------------------- */

export function NotificationFeed() {
  const navigate = useNavigate();
  const { aiOn } = useApp();
  const [sev, setSev] = useState<SignalSeverity | 'all'>('all');
  const [signals, setSignals] = useState(SIGNALS);

  const filtered = signals.filter((s) => sev === 'all' || s.severity === sev);
  const markRead = (id: string) => setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, read: true } : s)));

  return (
    <div className="pmrk-page">
      <PageHeader
        title="Лента сигналов"
        subtitle="Умная лента: ранжирование по существенности, фильтр шума · 58 видов в 12 категориях"
        breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Лента сигналов' }]}
        actions={<Button size="s" view="secondary" label="Правила внимания" onClick={() => navigate('/subscriptions')} />}
      />

      {aiOn && (
        <div className="pmrk-ai-surface pmrk-ai" style={{ marginBottom: 16 }}>
          <div className="pmrk-ai-accentbar" />
          <div className="pmrk-ai__head"><span className="pmrk-ai__badge">✦ AI</span><span style={{ fontWeight: 600 }}>Суммаризация ленты (AI-6/AI-7)</span></div>
          <div style={{ fontSize: 13 }}>Из {signals.length} событий значимых — {signals.filter((s) => s.severity === 'critical' || s.severity === 'high').length}. Топ-приоритет: 2 критических (иск + банкротство), общий объём под риском — {moneyCompact(34_200_000 + 88_000_000)}. Остальное — фоновый шум, свёрнут.</div>
        </div>
      )}

      <div className="pmrk-filterbar">
        {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
          <div key={s} className={`pmrk-filterchip ${sev === s ? 'pmrk-filterchip--active' : ''}`} onClick={() => setSev(s)}>
            {s === 'all' ? 'Все' : SEVERITY_LABEL[s]}
          </div>
        ))}
      </div>

      <div className="pmrk-feed">
        {filtered.map((s) => (
          <div key={s.id} className={`pmrk-signal pmrk-signal--${s.severity}`}>
            {!s.read && <span className="pmrk-signal__unread" />}
            <div style={{ flex: 1 }} onClick={() => s.counterpartyUid && navigate(`/counterparties/${s.counterpartyUid}`)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</span>
                <span className="pmrk-chip" style={{ background: 'var(--color-bg-secondary)', color: severityColor(s.severity), fontSize: 11 }}>{SEVERITY_LABEL[s.severity]}</span>
              </div>
              <div className="pmrk-muted" style={{ fontSize: 13, marginTop: 2 }}>{s.detail}</div>
              <div className="pmrk-muted" style={{ fontSize: 11.5, marginTop: 4 }}>{s.category} · {s.type} · {ago(s.date)}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              {s.amount && <b style={{ fontSize: 13 }}>{moneyCompact(s.amount)}</b>}
              {!s.read && <Button size="xs" view="clear" label="Прочитано" onClick={() => markRead(s.id)} />}
            </div>
          </div>
        ))}
        {!filtered.length && <EmptyState text="Нет сигналов по выбранному фильтру." />}
      </div>
    </div>
  );
}

/* --------------------------- Правила внимания ----------------------------- */

const CATEGORIES = [
  { name: 'Дебиторская задолженность', types: ['Рост просроченной ДЗ выше порога', 'Появление ПДЗ', 'Превышение лимита'], threshold: true },
  { name: 'Претензионно-исковая работа', types: ['Новый судебный иск', 'Претензия', 'Исполнительное производство'], threshold: true },
  { name: 'Банкротство', types: ['Введена процедура банкротства', 'Заявление о банкротстве'], threshold: false },
  { name: 'Санкции', types: ['Включение в санкционный список', 'Изменение санкционного статуса'], threshold: false },
  { name: 'Кредитный лимит', types: ['Заявка требует решения', 'Изменение КЛ', 'Истечение срока КЛ'], threshold: false },
  { name: 'Особый контроль', types: ['Предложение о включении', 'Решение по особому контролю'], threshold: false },
  { name: 'Новости', types: ['Значимое негативное событие', 'Появление новости'], threshold: true },
  { name: 'Отчётность', types: ['Отчётность старше 12 месяцев', 'Загружена новая отчётность'], threshold: false },
];

export function Subscriptions() {
  const [open, setOpen] = useState<string | null>('Дебиторская задолженность');
  return (
    <div className="pmrk-page">
      <PageHeader
        title="Правила внимания"
        subtitle="Управляемые правила вместо таблицы из 58 чек-боксов · пороги и скоупы Блок/БЕ–ДО–контрагент"
        breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Правила внимания' }]}
        actions={<Button size="s" label="Сохранить настройки" />}
      />
      <div className="pmrk-muted" style={{ fontSize: 13, marginBottom: 12 }}>12 категорий × 58 видов уведомлений. Включайте правило, задавайте порог существенности и область (на что подписаны).</div>
      {CATEGORIES.map((cat) => {
        const isOpen = open === cat.name;
        return (
          <div key={cat.name} className="pmrk-card" style={{ marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }} onClick={() => setOpen(isOpen ? null : cat.name)}>
              <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: 'var(--color-typo-secondary)' }}>▸</span>
              <span style={{ fontWeight: 600, flex: 1 }}>{cat.name}</span>
              <span className="pmrk-muted" style={{ fontSize: 12 }}>{cat.types.length} видов{cat.threshold ? ' · с порогом' : ''}</span>
              <label onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <input type="checkbox" defaultChecked /> вкл
              </label>
            </div>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--color-bg-border)', padding: '8px 16px 14px' }}>
                {cat.types.map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-bg-border)' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ flex: 1, fontSize: 13 }}>{t}</span>
                    {cat.threshold && (
                      <label style={{ fontSize: 12, color: 'var(--color-typo-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        порог <input type="text" defaultValue="1 млн ₽" style={{ width: 90, height: 28, border: '1px solid var(--color-bg-border)', borderRadius: 6, padding: '0 8px', background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)' }} />
                      </label>
                    )}
                    <select style={{ height: 28, border: '1px solid var(--color-bg-border)', borderRadius: 6, padding: '0 8px', background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)', fontSize: 12 }}>
                      <option>Блок / БЕ</option>
                      <option>ДО</option>
                      <option>Контрагент</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------- Задачи ---------------------------------- */

const TASK_TABS = [
  { key: 'all', label: 'Все', match: () => true },
  { key: 'attention', label: 'Требуют внимания', match: (s: string) => s === 'attention' },
  { key: 'overdue', label: 'Просрочено', match: (_s: string, d?: number) => (d ?? 0) < 0 },
  { key: 'soon', label: 'Срок ≤ 2 дней', match: (_s: string, d?: number) => (d ?? 99) >= 0 && (d ?? 99) <= 2 },
  { key: 'approval', label: 'На согласовании', match: (s: string) => s === 'approval' },
  { key: 'completed', label: 'Завершены', match: (s: string) => s === 'completed' },
] as const;

export function Tasks() {
  const [tab, setTab] = useState<string>('all');
  const apply = (key: string) => {
    const t = TASK_TABS.find((x) => x.key === key)!;
    return TASKS.filter((task) => t.match(task.status, task.dueInDays));
  };
  const rows = apply(tab);
  return (
    <div className="pmrk-page">
      <PageHeader title="Мои задачи" subtitle="Инбокс кредитного контролёра · задачи из всех разделов с признаком срока" breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Мои задачи' }]} />
      <div style={{ marginBottom: 12 }}>
        <Segmented
          value={tab}
          onChange={setTab}
          items={TASK_TABS.map((t) => ({ key: t.key as string, label: t.label, count: apply(t.key).length }))}
        />
      </div>
      <SectionCard pad={false}>
        <div style={{ padding: '0 16px' }}>
          {rows.map((t) => <TaskRow key={t.id} task={t} />)}
        </div>
        {!rows.length && <EmptyState text="Нет задач в этой вкладке." />}
      </SectionCard>
    </div>
  );
}

/* ------------------------------- Избранное -------------------------------- */

export function Favorites() {
  const navigate = useNavigate();
  const favs = ['cp-balt', 'cp-sibur', 'cp-rnsnab', 'cp-yugtrans'];
  return (
    <div className="pmrk-page">
      <PageHeader title="Избранное" subtitle="Контрагенты с прямыми ссылками" breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Избранное' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {favs.map((uid) => {
          const c = BY_UID.get(uid)!;
          return (
            <div key={uid} className="pmrk-card pmrk-card--pad pmrk-clickable" onClick={() => navigate(`/counterparties/${uid}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="pmrk-muted" style={{ fontSize: 12, marginTop: 2 }}>ИНН {c.inn} · {c.region}</div>
                </div>
                <GroupBadge group={c.group} withScore={c.score} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
