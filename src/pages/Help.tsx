import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { IconAllDone } from '@consta/icons/IconAllDone';
import { useApp } from '@/app/AppContext';
import { PageHeader, SectionCard } from '@/shared/ui/kit';
import { AI_CONSULTANT, type ConsultAnswer } from '@/shared/mock/ai';

/* AI-консультант (AI-1, раздел «Помощь» ФТ-9.4). Не угловой чат — это основной
   контент раздела. Ответы с обязательными цитатами-источниками (П-3),
   действие верификации УФК, реестр консультаций (часть аудита П-6). */

interface Msg { q: string; a: ConsultAnswer; verified?: boolean; }

/* Базовые материалы раздела — доступны всегда, без AI. */
const MATERIALS: { title: string; links: { label: string; note?: string }[] }[] = [
  {
    title: 'Методики и регламенты (НМД)',
    links: [
      { label: 'Методика М-13.08.01 — оценка покупателей нефти, газа, НП' },
      { label: 'Методика М-13.08.04 — авансирование' },
      { label: 'Регламент кредитного контроля ГК «Газпром нефть»' },
      { label: 'Порядок установления кредитного лимита (ФТ-6)' },
    ],
  },
  {
    title: 'Видео-инструкции',
    links: [
      { label: 'Как создать заявку на кредитный лимит', note: '4 мин' },
      { label: 'Экспресс-оценка контрагента', note: '6 мин' },
      { label: 'Работа с реестром и фильтрами', note: '3 мин' },
    ],
  },
  {
    title: 'Обучение и поддержка',
    links: [
      { label: 'Онлайн-курс «Инструменты оценки контрагентов»' },
      { label: 'ЕСО: запросы по работе ПМРК' },
      { label: 'База знаний и частые вопросы' },
    ],
  },
];

export function Help() {
  const { aiOn } = useApp();
  const [params] = useSearchParams();
  const [input, setInput] = useState(params.get('q') ?? '');
  const [thread, setThread] = useState<Msg[]>([]);
  const [thinking, setThinking] = useState(false);

  const ask = (q: string) => {
    const match = AI_CONSULTANT.find((c) => c.q.toLowerCase().includes(q.toLowerCase().slice(0, 8))) ?? AI_CONSULTANT[0];
    setThinking(true);
    setInput('');
    setTimeout(() => {
      setThread((t) => [...t, { q, a: match.a }]);
      setThinking(false);
    }, 700);
  };

  const verify = (i: number) => setThread((t) => t.map((m, idx) => (idx === i ? { ...m, verified: true } : m)));

  return (
    <div className="pmrk-page">
      <PageHeader title="Помощь" subtitle="Инструкции, методики и НМД по работе в ПМРК. При включённом AI — консультант с цитатами-источниками." breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Помощь' }]} />

      <SectionCard title="Инструкции и материалы">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px 28px' }}>
          {MATERIALS.map((g) => (
            <div key={g.title}>
              <div className="pmrk-muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: 8 }}>{g.title}</div>
              {g.links.map((l) => (
                <a key={l.label} href="#" onClick={(e) => e.preventDefault()} style={{ display: 'flex', gap: 7, fontSize: 13, color: 'var(--color-typo-brand)', textDecoration: 'none', padding: '5px 0', lineHeight: 1.4 }}>
                  <span style={{ opacity: 0.7 }}>→</span>
                  <span>{l.label}{l.note && <span className="pmrk-muted" style={{ marginLeft: 6 }}>· {l.note}</span>}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </SectionCard>

      {aiOn && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
          <div>
            <div className="pmrk-ai-surface" style={{ padding: 16, marginBottom: 16 }}>
              <div className="pmrk-ai-accentbar" />
              <div className="pmrk-ai__head"><span className="pmrk-ai__badge">✦ AI</span><span style={{ fontWeight: 600 }}>Консультант по финконтролю и платформе</span></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && input.trim() && ask(input)}
                  placeholder="Например: как рассчитывается уровень утверждения КЛ?"
                  style={{ flex: 1, height: 40, padding: '0 14px', borderRadius: 9, border: '1px solid var(--pmrk-ai-border)', background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)', outline: 'none', fontSize: 14 }}
                />
                <Button size="m" label="Спросить" disabled={!input.trim()} onClick={() => ask(input)} />
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {AI_CONSULTANT.map((c) => (
                  <button key={c.q} onClick={() => ask(c.q)} style={{ background: 'var(--color-bg-default)', border: '1px solid var(--pmrk-ai-border)', borderRadius: 16, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer', color: 'var(--pmrk-ai-strong)' }}>{c.q}</button>
                ))}
              </div>
            </div>

            {thread.map((m, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <div style={{ background: 'var(--color-bg-brand)', color: '#fff', padding: '8px 14px', borderRadius: '12px 12px 2px 12px', maxWidth: '80%', fontSize: 14 }}>{m.q}</div>
                </div>
                <div className="pmrk-ai-surface" style={{ padding: '14px 16px 14px 20px' }}>
                  <div className="pmrk-ai-accentbar" />
                  <div style={{ fontSize: 14, lineHeight: 1.55 }}>{m.a.answer}</div>
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--pmrk-ai-border)' }}>
                    <div className="pmrk-muted" style={{ fontSize: 11.5, marginBottom: 4 }}>Источники (цитирование обязательно — П-3):</div>
                    {m.a.citations.map((c, ci) => (
                      <div key={ci} style={{ fontSize: 12.5, color: 'var(--pmrk-ai-strong)' }}>• {c.label} <span className="pmrk-muted">({c.ref})</span></div>
                    ))}
                  </div>
                  <div className="pmrk-ai__foot">
                    <span>Справочный материал, не решение (П-2). 👍 👎</span>
                    <span style={{ flex: 1 }} />
                    {m.verified ? <span style={{ color: 'var(--pmrk-risk-1)', display: 'inline-flex', gap: 4, alignItems: 'center' }}><IconAllDone size="xs" /> Верифицировано УФК</span> : <Button size="xs" view="ghost" label="Запросить верификацию УФК" onClick={() => verify(i)} />}
                  </div>
                </div>
              </div>
            ))}

            {thinking && <div className="pmrk-ai-surface" style={{ padding: 16 }}><div className="pmrk-ai-accentbar" />Подбираю ответ по НМД…</div>}
          </div>

          <SectionCard title="Реестр консультаций">
            <div className="pmrk-muted" style={{ fontSize: 12, marginBottom: 8 }}>Журнал AI-консультаций — часть аудита (П-6) и обучающая выборка.</div>
            {[...thread].reverse().map((m, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-bg-border)', fontSize: 12.5 }}>{m.q}</div>
            ))}
            {!thread.length && <div className="pmrk-muted" style={{ fontSize: 12 }}>Пока пусто. Задайте вопрос — он попадёт в реестр.</div>}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
