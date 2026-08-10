import { useNavigate } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { IconDownload } from '@consta/icons/IconDownload';
import { IconDocFilled } from '@consta/icons/IconDocFilled';
import { PageHeader, SectionCard, StatusBadge } from '@/shared/ui/kit';
import { REPORTS } from '@/shared/mock/data';
import { dateRu } from '@/shared/format';

const REQUESTABLE = [
  { title: 'Профиль контрагента (РФ)', desc: 'до 10 ИНН, ИНН 9–12 символов', ft: 'ФТ-7.1', to: '/reports/profile-rf' },
  { title: 'Отчёт по иностранному контрагенту', desc: 'наименование, TIN, страна', ft: 'ФТ-7.2', to: '/reports/foreign' },
  { title: 'Отчёт по аффилированности', desc: 'до 20 контрагентов', ft: 'ФТ-4.5', to: '/reports/affiliation' },
  { title: 'Связанные стороны', desc: 'инструкция, шаблон, файл', ft: 'ФТ-4.4', to: '/reports/related-parties' },
  { title: 'Выгрузка экспресс-оценок', desc: 'по шаблону Прил. 5', ft: 'ФТ-3.6', to: '/assessments/mass' },
];

export function Reports() {
  const navigate = useNavigate();
  return (
    <div className="pmrk-page">
      <PageHeader title="Отчёты и выгрузки" subtitle="Заявки на отчёты и готовые выгрузки · превью того, что придёт" breadcrumbs={[{ label: 'Командный центр', to: '/' }, { label: 'Отчёты' }]} />

      <SectionCard title="Запросить отчёт">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {REQUESTABLE.map((r) => (
            <div key={r.title} className="pmrk-card pmrk-card--pad pmrk-clickable" style={{ display: 'flex', gap: 10 }} onClick={() => navigate(r.to)}>
              <IconDocFilled size="s" className="pmrk-muted" />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.title}</div>
                <div className="pmrk-muted" style={{ fontSize: 11.5 }}>{r.desc} · {r.ft}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Мои отчёты">
        <div className="pmrk-table">
          <div className="pmrk-table__head">
            <div className="pmrk-th" style={{ flex: 2 }}>Тип отчёта</div>
            <div className="pmrk-th" style={{ flex: 1 }}>Создан</div>
            <div className="pmrk-th" style={{ flex: 1 }}>Объектов</div>
            <div className="pmrk-th" style={{ flex: 1 }}>Формат</div>
            <div className="pmrk-th" style={{ flex: 1 }}>Статус</div>
            <div className="pmrk-th" style={{ flex: 1 }}> </div>
          </div>
          {REPORTS.map((r) => (
            <div key={r.id} className="pmrk-tr" style={{ cursor: 'default' }}>
              <div className="pmrk-td" style={{ flex: 2, fontWeight: 600 }}>{r.type}</div>
              <div className="pmrk-td" style={{ flex: 1 }}>{dateRu(r.createdAt)}</div>
              <div className="pmrk-td" style={{ flex: 1 }}>{r.objects}</div>
              <div className="pmrk-td" style={{ flex: 1, textTransform: 'uppercase' }}>{r.format}</div>
              <div className="pmrk-td" style={{ flex: 1 }}><StatusBadge status={r.status} /></div>
              <div className="pmrk-td" style={{ flex: 1, justifyContent: 'flex-end', display: 'flex' }}>
                {r.status === 'Готов' && <Button size="xs" view="ghost" label="Скачать" iconLeft={IconDownload as never} />}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
