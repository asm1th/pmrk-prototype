import { useState } from 'react';
import { Button } from '@consta/uikit/Button';
import { IconAdd } from '@consta/icons/IconAdd';
import { PageHeader, SectionCard, StatusBadge, GroupBadge, CalcStamp } from '@/shared/ui/kit';
import { HEROES } from '@/shared/mock/data';

const SECTIONS = [
  { key: 'data', label: 'Данные контрагентов' },
  { key: 'dictionaries', label: 'Справочники НСИ' },
  { key: 'routes', label: 'Маршруты согласования' },
  { key: 'formulas', label: 'Конструктор формул' },
  { key: 'integrations', label: 'Интеграции ТИ-1…13' },
  { key: 'quarantine', label: 'Карантин' },
];

export function Admin() {
  const [sec, setSec] = useState('routes');
  return (
    <div className="pmrk-page">
      <PageHeader title="Администрирование" subtitle="Данные, справочники, маршруты, формулы, интеграции · доступ только АДМ (маршруты — также КК-УФК)" breadcrumbs={[{ label: 'Командный центр', to: '/' }, { label: 'Администрирование' }]} />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
        <div className="pmrk-card" style={{ padding: 8 }}>
          {SECTIONS.map((s) => (
            <div key={s.key} className={`pmrk-nav__item ${sec === s.key ? 'pmrk-nav__item--active' : ''}`} onClick={() => setSec(s.key)} style={{ fontSize: 13 }}>{s.label}</div>
          ))}
        </div>
        <div>
          {sec === 'routes' && <RouteDesigner />}
          {sec === 'formulas' && <FormulaDesigner />}
          {sec === 'integrations' && <IntegrationMonitor />}
          {sec === 'data' && <SectionCard title="Управление данными контрагентов"><div className="pmrk-muted" style={{ fontSize: 13 }}>Правка любых атрибутов карточки с оптимистической блокировкой (If-Match/rowVersion), удаление профилей с подтверждением, настройка видимости разделов карточки. Каждая операция — в аудит.</div></SectionCard>}
          {sec === 'dictionaries' && <SectionCard title="Справочники НСИ"><div className="pmrk-muted" style={{ fontSize: 13 }}>Версионирование значений (valid_from/to, история не правится), импорт ТИ-13, контроль дублей кода (409).</div></SectionCard>}
          {sec === 'quarantine' && <SectionCard title="Карантин интеграций"><div className="pmrk-muted" style={{ fontSize: 13 }}>Записи, не сопоставленные с контрагентом: исходный jsonb, причина, действия REPROCESS / MANUAL_LINK / SKIP.</div></SectionCard>}
        </div>
      </div>
    </div>
  );
}

function RouteDesigner() {
  const [steps, setSteps] = useState([
    { role: 'ИСП', cond: 'всегда', title: 'Инициатор' },
    { role: 'КК-ДО', cond: 'уровень = ДО', title: 'Проверка КК ДО' },
    { role: 'КК-Блок', cond: 'КЛ > 100 млн', title: 'Согласование КК Блока' },
    { role: 'КО', cond: 'всегда', title: 'Решение кредитного комитета' },
  ]);
  return (
    <SectionCard title="Конструктор маршрутов согласования (ФТ-12.1)" extra={<Button size="xs" view="secondary" label="Опубликовать версию" />}>
      <div className="pmrk-muted" style={{ fontSize: 13, marginBottom: 12 }}>Единый UI: табличный редактор шагов + рендер диаграммы из табличного описания (без BPMN на фронте — вариант Б ADR-6).</div>
      {/* Диаграмма-рендер из таблицы */}
      <div className="pmrk-route" style={{ marginBottom: 16 }}>
        {steps.map((s, i) => (
          <div key={i} className="pmrk-route__step pmrk-route__step--upcoming">
            <div className="pmrk-route__num">Шаг {i + 1} · {s.role}</div>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>{s.title}</div>
            <div className="pmrk-muted" style={{ fontSize: 11 }}>условие: {s.cond}</div>
          </div>
        ))}
      </div>
      {/* Табличный редактор */}
      <div className="pmrk-table">
        <div className="pmrk-table__head"><div className="pmrk-th" style={{ flex: 0.4 }}>#</div><div className="pmrk-th" style={{ flex: 1 }}>Роль</div><div className="pmrk-th" style={{ flex: 1.5 }}>Шаг</div><div className="pmrk-th" style={{ flex: 1.5 }}>Условие</div></div>
        {steps.map((s, i) => (
          <div key={i} className="pmrk-tr" style={{ cursor: 'default' }}>
            <div className="pmrk-td" style={{ flex: 0.4 }}>{i + 1}</div>
            <div className="pmrk-td" style={{ flex: 1 }}>{s.role}</div>
            <div className="pmrk-td" style={{ flex: 1.5 }}>{s.title}</div>
            <div className="pmrk-td" style={{ flex: 1.5 }}>{s.cond}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <Button size="xs" view="ghost" label="Добавить шаг" iconLeft={IconAdd as never} onClick={() => setSteps((s) => [...s.slice(0, -1), { role: 'КК-УФК', cond: 'ad-hoc', title: 'Доп. согласование' }, s[s.length - 1]])} />
      </div>
    </SectionCard>
  );
}

function FormulaDesigner() {
  const [weights, setWeights] = useState({ fin: 45, pay: 35, rep: 20 });
  const [cpUid, setCpUid] = useState('cp-balt');
  const cp = HEROES.find((h) => h.uid === cpUid)!;
  const preview = Math.round((cp.score * (weights.fin + weights.pay + weights.rep)) / 100);
  const group = preview >= 75 ? 1 : preview >= 55 ? 2 : preview >= 35 ? 3 : 4;
  return (
    <SectionCard title="Конструктор формул и параметров методик (ФТ-12.3/12.4)" extra={<Button size="xs" view="secondary" label="Активировать версию" />}>
      <div className="pmrk-muted" style={{ fontSize: 13, marginBottom: 12 }}>Редактирование DRAFT-версии: веса блоков, шкалы 0/40/70/100, пороги групп, СТОП-факторы. Песочница — тестовый расчёт без сохранения.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Веса блоков показателей</div>
          {([['fin', 'Финансовое положение'], ['pay', 'Платёжная дисциплина'], ['rep', 'Деловая репутация']] as const).map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ flex: 1, fontSize: 13 }}>{l}</span>
              <input type="range" min={0} max={100} value={weights[k]} onChange={(e) => setWeights((w) => ({ ...w, [k]: Number(e.target.value) }))} />
              <span className="pmrk-tnum" style={{ width: 40, textAlign: 'right' }}>{weights[k]}%</span>
            </div>
          ))}
          <div className="pmrk-muted" style={{ fontSize: 11 }}>Пороги групп: ≥75 → 1, ≥55 → 2, ≥35 → 3, иначе 4</div>
        </div>
        <div className="pmrk-ai-surface" style={{ padding: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Песочница «было/стало»</div>
          <select value={cpUid} onChange={(e) => setCpUid(e.target.value)} style={{ width: '100%', height: 32, marginBottom: 12, border: '1px solid var(--color-bg-border)', borderRadius: 6, padding: '0 8px', background: 'var(--color-bg-default)', color: 'var(--color-typo-primary)' }}>
            {HEROES.map((h) => <option key={h.uid} value={h.uid}>{h.shortName}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div><div className="pmrk-muted" style={{ fontSize: 11 }}>Было</div><GroupBadge group={cp.group} withScore={cp.score} /></div>
            <span style={{ fontSize: 18 }}>→</span>
            <div><div className="pmrk-muted" style={{ fontSize: 11 }}>Стало (preview)</div><GroupBadge group={group as 1 | 2 | 3 | 4} withScore={preview} /></div>
          </div>
          <div style={{ marginTop: 8 }}><CalcStamp live /></div>
          <div className="pmrk-muted" style={{ fontSize: 11, marginTop: 6 }}>Расчёт детерминированный (scoring), без сохранения версии.</div>
        </div>
      </div>
    </SectionCard>
  );
}

const FLOWS = [
  { ti: 'ТИ-1', name: 'UserDirectoryClient', status: 'OK', last: '15.06 08:00', next: '16.06 08:00', errors: 0 },
  { ti: 'ТИ-2', name: 'SparkClient / SparkAffiliation', status: 'OK', last: '15.06 06:30', next: '16.06 06:30', errors: 0 },
  { ti: 'ТИ-4', name: 'CuracaoClient', status: 'Ошибки', last: '15.06 05:00', next: '16.06 05:00', errors: 3 },
  { ti: 'ТИ-6', name: 'XComplianceClient (санкции)', status: 'OK', last: '15.06 04:00', next: '16.06 04:00', errors: 0 },
  { ti: 'ТИ-9', name: 'AgataFileLoader (PD)', status: 'OK', last: '15.06 03:00', next: '16.06 03:00', errors: 0 },
  { ti: 'ТИ-11', name: 'ArmKkClient (ДЗ)', status: 'Выполняется', last: '15.06 09:00', next: '—', errors: 0 },
  { ti: 'ТИ-12', name: 'PrimoFileLoader (новости)', status: 'OK', last: '15.06 07:15', next: '16.06 07:15', errors: 0 },
  { ti: 'ТИ-13', name: 'NsiFileLoader (справочники)', status: 'OK', last: '14.06 22:00', next: '16.06 22:00', errors: 0 },
];

function IntegrationMonitor() {
  return (
    <SectionCard title="Мониторинг интеграций (ТИ-1…13)">
      <div className="pmrk-table">
        <div className="pmrk-table__head">
          <div className="pmrk-th" style={{ flex: 0.6 }}>ТИ</div>
          <div className="pmrk-th" style={{ flex: 2 }}>Поток</div>
          <div className="pmrk-th" style={{ flex: 1 }}>Статус</div>
          <div className="pmrk-th" style={{ flex: 1 }}>Последний</div>
          <div className="pmrk-th" style={{ flex: 1 }}>Следующий</div>
          <div className="pmrk-th" style={{ flex: 0.7 }}>Ошибки</div>
          <div className="pmrk-th" style={{ flex: 1 }}> </div>
        </div>
        {FLOWS.map((f) => (
          <div key={f.ti} className="pmrk-tr" style={{ cursor: 'default' }}>
            <div className="pmrk-td" style={{ flex: 0.6, fontWeight: 600 }}>{f.ti}</div>
            <div className="pmrk-td" style={{ flex: 2 }}>{f.name}</div>
            <div className="pmrk-td" style={{ flex: 1 }}><StatusBadge status={f.status === 'OK' ? 'Действующее' : f.status === 'Выполняется' ? 'Формируется' : 'Ошибка'} /></div>
            <div className="pmrk-td" style={{ flex: 1 }}>{f.last}</div>
            <div className="pmrk-td" style={{ flex: 1 }}>{f.next}</div>
            <div className="pmrk-td" style={{ flex: 0.7, color: f.errors ? 'var(--pmrk-risk-4)' : undefined }}>{f.errors}</div>
            <div className="pmrk-td" style={{ flex: 1, justifyContent: 'flex-end', display: 'flex' }}><Button size="xs" view="ghost" label="Запустить" /></div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
