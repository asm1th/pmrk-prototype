import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { IconAdd } from '@consta/icons/IconAdd';
import { IconForward } from '@consta/icons/IconForward';
import { IconSearchStroked } from '@consta/icons/IconSearchStroked';
import { useApp } from '@/app/AppContext';
import { ROLES } from '@/shared/roles';
import { PageHeader, SectionCard, GroupBadge } from '@/shared/ui/kit';
import { REGISTRY, FAVORITES, BY_UID } from '@/shared/mock/data';
import type { Counterparty } from '@/shared/mock/types';

/* ============================================================================
   Главная. Одно действие — найти контрагента. Портфель, лента и задачи вынесены
   в «Командный центр» отдельным пунктом меню: главная не должна конкурировать
   с поиском за внимание.

   Ключевой момент: предложение завести карточку появляется РОВНО тогда, когда
   поиск ничего не нашёл, — не висит постоянной кнопкой. Так пользователь сначала
   убеждается, что контрагента нет, и только потом заводит заявку (ФТ-1.22…1.24).
   ========================================================================== */

/* Плитки главной страницы по ЕОЛ (EDT): точки входа ФТ-3.9, заявки на отчёты
   ФТ-4.4/4.5 и ФТ-7.1/7.2. Маршруты — существующие страницы прототипа. */
const EDT_ACTIONS: { label: string; hint: string; to: string }[] = [
  { label: 'Провести экспресс-оценку', hint: 'Кредитоспособность контрагента (ФТ-3.1)', to: '/assessments/new' },
  { label: 'Расчёт лимита авансирования', hint: 'Лимит авансового платежа, Ш-13.08-03', to: '/assessments/new?direction=ADVANCE' },
  { label: 'Выгрузить экспресс-оценки', hint: 'Массовая оценка списком (ФТ-3.8)', to: '/assessments/mass' },
  { label: 'Отчет «Профиль контрагента»', hint: 'До 10 ИНН, результат на почту (ФТ-7.1)', to: '/reports/profile-rf' },
  { label: 'Отчет по иностранному контрагенту', hint: 'По данным СПАРК (ФТ-7.2)', to: '/reports/foreign' },
  { label: 'Запрос отчета по аффилированности', hint: 'Связи между заданными к/а (ФТ-4.5)', to: '/reports/affiliation' },
  { label: 'Выгрузить связанные стороны', hint: 'Отчет по шаблону Приложения 4 (ФТ-4.4)', to: '/reports/related-parties' },
];

/* Кнопки-ссылки на внешние BI-дашборды (ФТ-8.1…8.4); в прототипе — заглушки. */
const EDT_DASHBOARDS = [
  'Риск-индикаторы по контрагентам ГК ГПН',
  'Мониторинг ДЗ и ПДЗ',
  'Мониторинг авансов',
  'Мониторинг КЗ',
];

type Tone = 'good' | 'warn' | 'bad';

const VERDICT_TONE: Record<Tone, { color: string; bg: string }> = {
  good: { color: 'var(--pmrk-risk-1)', bg: 'var(--pmrk-risk-1-bg)' },
  warn: { color: 'var(--pmrk-risk-3)', bg: 'var(--pmrk-risk-3-bg)' },
  bad: { color: 'var(--pmrk-risk-4)', bg: 'var(--pmrk-risk-4-bg)' },
};

/** Перевод риск-группы/статуса/санкций в вердикт человеческим языком (профиль light). */
function userVerdict(c: Counterparty): { tone: Tone; label: string } {
  if (c.underSanctions || c.status === 'Банкротство' || c.status === 'Ликвидация' || c.group === 4) {
    return { tone: 'bad', label: 'Высокий риск' };
  }
  if (c.group === 3) return { tone: 'warn', label: 'С осторожностью' };
  return { tone: 'good', label: 'Можно работать' };
}

function VerdictPill({ tone, label }: { tone: Tone; label: string }) {
  const t = VERDICT_TONE[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px', borderRadius: 999, background: t.bg, color: t.color, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: t.color, flex: 'none' }} />
      {label}
    </span>
  );
}

/** Строка компании. Роль «Пользователь» получает вердикт словами, остальные — группу с баллом. */
function CompanyRow({ c, simple, onClick }: { c: Counterparty; simple: boolean; onClick: () => void }) {
  const v = userVerdict(c);
  return (
    <button
      onClick={onClick}
      className="pmrk-clickable"
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 14px', border: '1px solid var(--color-bg-border)', borderRadius: 12, background: 'var(--color-bg-default)', cursor: 'pointer' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }} className="pmrk-truncate">{c.name}</div>
        <div className="pmrk-muted" style={{ fontSize: 12.5, marginTop: 2 }}>ИНН {c.inn} · {c.region}</div>
      </div>
      {simple ? <VerdictPill tone={v.tone} label={v.label} /> : <GroupBadge group={c.group} withScore={c.score} />}
      <IconForward size="s" className="pmrk-muted" />
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { role } = useApp();
  const simple = ROLES[role].profile === 'light';

  const [q, setQ] = useState('');
  const term = q.trim();
  const query = term.toLowerCase();

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return REGISTRY.filter((c) => c.name.toLowerCase().includes(query) || c.inn.includes(query)).slice(0, 8);
  }, [query]);

  const searched = query.length >= 2;
  const nothingFound = searched && results.length === 0;
  const looksLikeInn = /^\d{5,}$/.test(term);

  const open = (uid: string) => navigate(`/counterparties/${uid}/general`);
  const requestCard = () => navigate(`/counterparties/request?q=${encodeURIComponent(term)}`);

  // Enter: точное совпадение по ИНН или единственный результат открываем сразу;
  // если не нашли ничего — сразу ведём в заявку, чтобы не заставлять целиться в кнопку.
  const submit = () => {
    const exact = REGISTRY.find((c) => c.inn === term);
    if (exact) return open(exact.uid);
    if (results.length === 1) return open(results[0].uid);
    if (nothingFound) requestCard();
  };

  return (
    <div className="pmrk-page" style={{ maxWidth: 760 }}>
      <PageHeader
        title="Главная"
        subtitle={
          simple
            ? 'Узнайте, можно ли работать с компанией — введите её название или ИНН.'
            : 'Найдите контрагента по наименованию или ИНН. Портфель, сигналы и задачи — в командном центре.'
        }
      />

      {/* Поиск — единственное действие экрана */}
      <SectionCard>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 16px', border: '1px solid var(--color-bg-border)', borderRadius: 12, background: 'var(--color-bg-default)' }}>
            <IconSearchStroked size="s" className="pmrk-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Наименование или ИНН контрагента"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: 'var(--color-typo-primary)' }}
            />
          </div>
          <Button size="l" label={simple ? 'Проверить' : 'Найти'} onClick={submit} />
        </div>
        <div className="pmrk-muted" style={{ fontSize: 12, marginTop: 8 }}>Например: «Газпром нефть» или 5504036333</div>
      </SectionCard>

      {/* Нашли — показываем карточки */}
      {searched && results.length > 0 && (
        <SectionCard title="Найденные контрагенты">
          <div className="pmrk-stack" style={{ gap: 8 }}>
            {results.map((c) => (
              <CompanyRow key={c.uid} c={c} simple={simple} onClick={() => open(c.uid)} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Не нашли — здесь и сейчас предлагаем завести карточку заявкой */}
      {nothingFound && (
        <SectionCard title="Карточка не найдена">
          <div className="pmrk-muted" style={{ fontSize: 13 }}>
            По запросу «{term}» в реестре ПМРК ничего нет.{' '}
            {looksLikeInn ? 'Проверьте ИНН — в нём 10 цифр у организации и 12 у ИП.' : 'Проверьте написание или введите ИНН.'}
          </div>

          <div style={{ marginTop: 14, padding: 16, border: '1px dashed var(--color-bg-border)', borderRadius: 12, background: 'var(--color-bg-secondary)' }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Контрагента ещё нет в ПМРК?</div>
            <div className="pmrk-muted" style={{ fontSize: 12.5, marginTop: 4, maxWidth: 520 }}>
              Оформите заявку на создание карточки: профиль заводится по ИНН, реквизиты, ОКВЭД и связи
              подтянутся из СПАРК и ЕГРЮЛ при ближайшей синхронизации.
            </div>
            <div style={{ marginTop: 12 }}>
              <Button size="m" label="Создать заявку на карточку" iconLeft={IconAdd as never} onClick={requestCard} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Поиск ещё не начат — недавние контрагенты как быстрый вход */}
      {!searched && (
        <SectionCard title="Недавние контрагенты">
          <div className="pmrk-stack" style={{ gap: 8 }}>
            {FAVORITES.map((uid) => {
              const c = BY_UID.get(uid);
              return c ? <CompanyRow key={uid} c={c} simple={simple} onClick={() => open(uid)} /> : null;
            })}
          </div>
        </SectionCard>
      )}

      {/* Плитки действий из ЕОЛ: прячем во время поиска, чтобы не конкурировать
          с результатами за внимание. */}
      {!searched && (
        <SectionCard title="Действия">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
            {EDT_ACTIONS.map((a) => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="pmrk-clickable"
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 14px', border: '1px solid var(--color-bg-border)', borderRadius: 12, background: 'var(--color-bg-default)', cursor: 'pointer' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
                  <div className="pmrk-muted" style={{ fontSize: 12, marginTop: 2 }}>{a.hint}</div>
                </div>
                <IconForward size="s" className="pmrk-muted" />
              </button>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Дашборды (ФТ-8.1…8.4) — внешние BI, в прототипе не подключены; обучение (ФТ-9.4) */}
      {!searched && (
        <SectionCard title="Дашборды и обучение">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {EDT_DASHBOARDS.map((d) => (
              <a
                key={d}
                href="#"
                onClick={(e) => e.preventDefault()}
                title="Внешний BI-дашборд — в прототипе не подключён"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--color-bg-border)', borderRadius: 999, fontSize: 13, textDecoration: 'none', color: 'var(--color-typo-secondary)', background: 'var(--color-bg-default)' }}
              >
                {d} ↗
              </a>
            ))}
            <Button size="s" view="secondary" label="Обучение работе на Платформе" onClick={() => navigate('/help')} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
