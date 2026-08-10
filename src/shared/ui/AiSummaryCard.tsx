import { useState } from 'react';
import { Button } from '@consta/uikit/Button';
import { IconForward } from '@consta/icons/IconForward';
import { IconAllDone } from '@consta/icons/IconAllDone';
import type { AiSummary, AiFactor } from '@/shared/mock/ai';
import { Skel } from './kit';

/* AI-Summary — фирменный компонент (AI-2 / AI-8). Граница AI всегда видна:
   бейдж, цитаты-источники, дисклеймер «проверьте», действие «верифицировать».
   Сворачиваемый. Числа методик сюда не попадают (П-1) — только вербализация. */

function Arrow({ d }: { d: AiFactor['direction'] }) {
  if (d === 'up') return <span className="pmrk-arrow-up" title="Повышает риск">▲</span>;
  if (d === 'down') return <span className="pmrk-arrow-down" title="Снижает риск">▼</span>;
  return <span className="pmrk-arrow-flat" title="Нейтрально">■</span>;
}

export function AiSummaryCard(props: {
  title?: string;
  summary: AiSummary;
  loading?: boolean;
  onJump?: (to: string) => void;
  defaultOpen?: boolean;
  variant?: 'profile' | 'group';
}) {
  const [open, setOpen] = useState(props.defaultOpen ?? true);
  const [verified, setVerified] = useState(false);
  const title = props.title ?? (props.variant === 'group' ? 'AI-резюме риска группы' : 'AI-резюме риска контрагента');

  if (props.loading) {
    return (
      <div className="pmrk-ai-surface pmrk-ai">
        <div className="pmrk-ai-accentbar" />
        <div className="pmrk-ai__head">
          <span className="pmrk-ai__badge">✦ AI</span>
          <span style={{ fontWeight: 600 }}>{title}</span>
        </div>
        <Skel w="92%" h={16} style={{ marginBottom: 8 }} />
        <Skel w="78%" h={16} style={{ marginBottom: 16 }} />
        <Skel w="60%" h={12} />
      </div>
    );
  }

  const { summary } = props;
  return (
    <div className="pmrk-ai-surface pmrk-ai pmrk-enter">
      <div className="pmrk-ai-accentbar" />
      <div className="pmrk-ai__head">
        <span className="pmrk-ai__badge">✦ AI</span>
        <span style={{ fontWeight: 600, flex: 1 }}>{title}</span>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pmrk-ai-strong)', fontSize: 12 }}
        >
          {open ? 'Свернуть' : 'Развернуть'}
        </button>
      </div>

      {open && (
        <>
          <div className="pmrk-ai__verdict">{summary.verdict}</div>

          <div>
            {summary.factors.map((f, i) => (
              <div className="pmrk-ai__factor" key={i}>
                <Arrow d={f.direction} />
                <div style={{ flex: 1 }}>
                  <div>{f.text}</div>
                  {f.to ? (
                    <a
                      className="pmrk-ai__src"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        props.onJump?.(f.to!);
                      }}
                    >
                      {f.source} <IconForward size="xs" style={{ verticalAlign: 'middle' }} />
                    </a>
                  ) : (
                    <span className="pmrk-ai__src" style={{ cursor: 'default' }}>{f.source}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pmrk-ai__foot">
            <span className="pmrk-ai__badge" style={{ background: 'var(--pmrk-ai-strong)' }}>✦ AI</span>
            <span>Сформировано {summary.asOf.split('-').reverse().join('.')} · черновик-рекомендация, проверьте перед использованием (П-2)</span>
            <span style={{ flex: 1 }} />
            {verified ? (
              <span style={{ color: 'var(--pmrk-risk-1)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconAllDone size="xs" /> Верифицировано УФК
              </span>
            ) : (
              <Button size="xs" view="ghost" label="Верифицировать" iconLeft={IconAllDone} onClick={() => setVerified(true)} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
