import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { IconAllDone } from '@consta/icons/IconAllDone';
import { IconAdd } from '@consta/icons/IconAdd';
import { useApp } from '@/app/AppContext';
import { ROLES } from '@/shared/roles';
import { PageHeader, SectionCard, FileDrop } from '@/shared/ui/kit';
import { SUBS } from '@/shared/mock/data';

/* ============================================================================
   Заявка на создание карточки контрагента (ФТ-1.24). Открывается с главной в
   момент, когда поиск ничего не нашёл: ИНН или наименование из запроса уже
   подставлены — пользователю остаётся дозаполнить контекст и отправить.
   ========================================================================== */

const PURPOSES = [
  'Заключение договора поставки',
  'Разовая отгрузка',
  'Проверка перед сделкой',
  'Иное (укажите в комментарии)',
];

const inputStyle: React.CSSProperties = {
  width: '100%', height: 36, padding: '0 10px',
  border: '1px solid var(--color-bg-border)', borderRadius: 8, fontSize: 13,
  background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)',
};

function Field({ label, hint, children }: { label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="pmrk-muted" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div className="pmrk-muted" style={{ fontSize: 11, marginTop: 4 }}>{hint}</div>}
    </label>
  );
}

const req = <span style={{ color: 'var(--pmrk-risk-4)' }}> *</span>;

export function CounterpartyRequest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { role } = useApp();

  // Запрос с главной: цифры трактуем как ИНН, остальное — как наименование.
  const q = (params.get('q') ?? '').trim();
  const qIsInn = /^\d+$/.test(q);

  const [inn, setInn] = useState(qIsInn ? q : '');
  const [name, setName] = useState(qIsInn ? '' : q);
  const [sent, setSent] = useState(false);

  const innValid = /^\d+$/.test(inn) && inn.length >= 9 && inn.length <= 12;
  const innError = inn.length > 0 && !innValid;
  const canSend = innValid && name.trim().length > 1;

  if (sent) {
    return (
      <div className="pmrk-page" style={{ maxWidth: 760 }}>
        <PageHeader
          title="Заявка отправлена"
          subtitle="Карточка появится в реестре после проверки и первой синхронизации с СПАРК."
          breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Заявка на карточку' }]}
        />
        <SectionCard>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--pmrk-risk-1)', marginTop: 2 }}><IconAllDone size="m" /></span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Заявка ЗК-2026-0148 · {name.trim()}</div>
              <div className="pmrk-muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.55 }}>
                ИНН {inn} · инициатор: {ROLES[role].title}.<br />
                Ответственный — администратор ПМРК. Срок создания карточки — 1 рабочий день.
                О готовности придёт сигнал в ленту, карточка станет доступна по поиску.
              </div>
              <div className="pmrk-row" style={{ gap: 8, marginTop: 14 }}>
                <Button size="s" label="На главную" onClick={() => navigate('/')} />
                <Button size="s" view="ghost" label="Создать ещё одну" iconLeft={IconAdd as never} onClick={() => { setSent(false); setInn(''); setName(''); }} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="pmrk-page" style={{ maxWidth: 760 }}>
      <PageHeader
        title="Заявка на создание карточки контрагента"
        subtitle="ФТ-1.24 · профиль заводится по ИНН, реквизиты подтянутся из СПАРК и ЕГРЮЛ"
        breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Заявка на карточку' }]}
      />

      <SectionCard title="Контрагент">
        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, marginBottom: 16 }}>
          ℹ Проверьте ИНН и наименование. После отправки карточка создаётся по ИНН; реквизиты, ОКВЭД и связи
          подтянутся из интеграций при ближайшей синхронизации. До наполнения часть вкладок профиля будет
          помечена «Раздел временно недоступен».
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label={<>ИНН{req}</>} hint="9–12 цифр: 10 — организация, 12 — ИП">
            <input
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              placeholder="5504036333"
              className="pmrk-tnum"
              style={{ ...inputStyle, borderColor: innError ? 'var(--pmrk-risk-4)' : 'var(--color-bg-border)' }}
            />
          </Field>
          <Field label={<>Наименование{req}</>} hint="как в ЕГРЮЛ, с организационно-правовой формой">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ООО «Название»" style={inputStyle} />
          </Field>
          <Field label="ДО ГК ГПН, которое будет работать с контрагентом">
            <select style={inputStyle} defaultValue={SUBS[0]}>
              {SUBS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Цель создания карточки">
            <select style={inputStyle} defaultValue={PURPOSES[0]}>
              {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {innError && (
          <div style={{ color: 'var(--pmrk-risk-4)', fontSize: 12, marginTop: 8 }}>
            ИНН должен состоять из 9–12 цифр без пробелов.
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Field label="Комментарий для кредитного контролёра">
            <textarea
              rows={3}
              placeholder="Планируемый объём, условия оплаты, срочность — что поможет быстрее обработать заявку"
              style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>
        </div>

        <div style={{ marginTop: 16 }}>
          <div className="pmrk-muted" style={{ fontSize: 12, marginBottom: 6 }}>Вложения (необязательно)</div>
          <FileDrop hint="Карточка предприятия, устав, проект договора · PDF, XLSX, DOCX" accept=".pdf,.xlsx,.xls,.docx,.doc" />
        </div>
      </SectionCard>

      <div className="pmrk-row" style={{ gap: 8, justifyContent: 'flex-end' }}>
        <Button size="s" view="ghost" label="Отмена" onClick={() => navigate('/')} />
        <Button size="s" label="Отправить заявку" disabled={!canSend} onClick={() => setSent(true)} />
      </div>
    </div>
  );
}
