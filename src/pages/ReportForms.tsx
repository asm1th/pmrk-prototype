import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { IconAdd } from '@consta/icons/IconAdd';
import { IconTrash } from '@consta/icons/IconTrash';
import { PageHeader, SectionCard, FileDrop } from '@/shared/ui/kit';
import { BY_UID } from '@/shared/mock/data';

/* Формы запроса отчётов (ФТ-7.1/7.2, ФТ-4.4/4.5). Лёгкие, не «формозаполнение»:
   инструкция сверху, минимум полей, доп. получатели, превью результата. */

const inputStyle: React.CSSProperties = { width: '100%', height: 36, padding: '0 10px', border: '1px solid var(--color-bg-border)', borderRadius: 8, background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)', outline: 'none', fontSize: 13 };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label style={{ display: 'block' }}>
      <div className="pmrk-muted" style={{ fontSize: 12, marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div className="pmrk-muted" style={{ fontSize: 11, marginTop: 2 }}>{hint}</div>}
    </label>
  );
}

function RecipientsInput() {
  const [list, setList] = useState<{ name: string; email: string }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="ФИО" value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input placeholder="e-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <Button size="s" view="secondary" iconLeft={IconAdd as never} onlyIcon disabled={!name || !email} onClick={() => { setList((l) => [...l, { name, email }]); setName(''); setEmail(''); }} />
      </div>
      {list.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {list.map((r, i) => (
            <span key={i} className="pmrk-chip" style={{ background: 'var(--color-bg-secondary)' }}>
              {r.name} · {r.email}
              <span className="pmrk-clickable" onClick={() => setList((l) => l.filter((_, idx) => idx !== i))} style={{ marginLeft: 4 }}>✕</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Instruction({ text }: { text: string }) {
  return <div style={{ padding: '10px 12px', background: 'var(--color-bg-secondary)', borderRadius: 8, fontSize: 12.5, color: 'var(--color-typo-secondary)', marginBottom: 16 }}>ℹ {text}</div>;
}

function Shell({ title, ft, children }: { title: string; ft: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="pmrk-page" style={{ maxWidth: 860 }}>
      <PageHeader title={title} subtitle={ft} breadcrumbs={[{ label: 'Отчёты', to: '/reports' }, { label: title }]} />
      {children}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <Button size="s" view="ghost" label="Закрыть" onClick={() => navigate('/reports')} />
        <Button size="s" label="Сохранить и запросить" onClick={() => navigate('/reports')} />
      </div>
    </div>
  );
}

/* ----- ФТ-7.1: Профиль контрагента (РФ), 1–10 ИНН ----- */
export function ProfileReportRequest() {
  const [rows, setRows] = useState<string[]>(['', '']);
  const valid = (v: string) => v === '' || (/^\d+$/.test(v) && v.length >= 9 && v.length <= 12);
  return (
    <Shell title="Отчёт «Профиль контрагента» (РФ)" ft="ФТ-7.1 · до 10 ИНН, первый обязателен">
      <SectionCard title="Контрагенты">
        <Instruction text="Укажите от 1 до 10 ИНН. Первый — обязателен. ИНН: 9–12 символов. Отчёт придёт на вашу почту и в раздел «Мои отчёты»." />
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="pmrk-muted" style={{ width: 24, fontSize: 12 }}>{i + 1}.</span>
              <input value={v} onChange={(e) => setRows((r) => r.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={i === 0 ? 'ИНН (обязательно)' : 'ИНН'} style={{ ...inputStyle, flex: 1, borderColor: valid(v) ? 'var(--color-bg-border)' : 'var(--pmrk-risk-4)' }} />
              {rows.length > 1 && <Button size="s" view="clear" onlyIcon iconLeft={IconTrash as never} onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))} />}
              {!valid(v) && <span style={{ color: 'var(--pmrk-risk-4)', fontSize: 11 }}>9–12 цифр</span>}
            </div>
          ))}
        </div>
        {rows.length < 10 && <div style={{ marginTop: 8 }}><Button size="xs" view="ghost" label="Добавить ИНН" iconLeft={IconAdd as never} onClick={() => setRows((r) => [...r, ''])} /></div>}
      </SectionCard>
      <SectionCard title="Дополнительные получатели"><RecipientsInput /></SectionCard>
    </Shell>
  );
}

/* ----- ФТ-7.2: Иностранный контрагент ----- */
export function ForeignReportRequest() {
  const [params] = useSearchParams();
  const cp = params.get('uid') ? BY_UID.get(params.get('uid')!) : undefined;
  return (
    <Shell title="Отчёт по иностранному контрагенту" ft="ФТ-7.2 · автозаполнение из карточки нерезидента">
      <SectionCard title="Параметры">
        <Instruction text="Для нерезидента укажите наименование (обязательно), при наличии — TIN и страну регистрации." />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Наименование *"><input defaultValue={cp?.name ?? ''} style={inputStyle} /></Field>
          <Field label="TIN"><input style={inputStyle} /></Field>
          <Field label="Страна регистрации"><input placeholder="напр. Кипр" style={inputStyle} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Дополнительные получатели"><RecipientsInput /></SectionCard>
    </Shell>
  );
}

/* ----- ФТ-4.5: Отчёт по аффилированности, до 20 к/а ----- */
export function AffiliationReportRequest() {
  const [rows, setRows] = useState([{ name: '', inn: '' }]);
  return (
    <Shell title="Отчёт по аффилированности" ft="ФТ-4.5 · до 20 контрагентов">
      <SectionCard title="Контрагенты (до 20)">
        <Instruction text="Перечислите контрагентов (№, наименование, ИНН). Будет построен консолидированный отчёт по связанным сторонам (шаблон Прил. 4)." />
        <div style={{ display: 'grid', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="pmrk-muted" style={{ width: 24, fontSize: 12 }}>{i + 1}.</span>
              <input value={r.name} onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Наименование" style={{ ...inputStyle, flex: 2 }} />
              <input value={r.inn} onChange={(e) => setRows((rs) => rs.map((x, idx) => idx === i ? { ...x, inn: e.target.value } : x))} placeholder="ИНН" style={{ ...inputStyle, flex: 1 }} />
              {rows.length > 1 && <Button size="s" view="clear" onlyIcon iconLeft={IconTrash as never} onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))} />}
            </div>
          ))}
        </div>
        {rows.length < 20 && <div style={{ marginTop: 8 }}><Button size="xs" view="ghost" label="Добавить контрагента" iconLeft={IconAdd as never} onClick={() => setRows((r) => [...r, { name: '', inn: '' }])} /></div>}
      </SectionCard>
      <SectionCard title="Дополнительные получатели"><RecipientsInput /></SectionCard>
    </Shell>
  );
}

/* ----- ФТ-4.4: Связанные стороны ----- */
export function RelatedPartiesRequest() {
  return (
    <Shell title="Выгрузка связанных сторон" ft="ФТ-4.4 · инструкция, шаблон, файл">
      <SectionCard title="Загрузка">
        <Instruction text="Скачайте шаблон, заполните список контрагентов и загрузите файл. Результат — выгрузка связанных сторон по шаблону Прил. 4." />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button size="s" view="secondary" label="Скачать шаблон (.xlsx)" />
        </div>
        <div><div className="pmrk-muted" style={{ fontSize: 12, marginBottom: 4 }}>Файл со списком контрагентов</div><FileDrop multiple={false} hint="XLSX по шаблону · список контрагентов" accept=".xlsx,.xls" /></div>
      </SectionCard>
      <SectionCard title="Дополнительные получатели"><RecipientsInput /></SectionCard>
    </Shell>
  );
}
