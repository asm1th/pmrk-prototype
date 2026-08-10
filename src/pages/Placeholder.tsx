import { useNavigate } from 'react-router-dom';
import { Button } from '@consta/uikit/Button';
import { PageHeader, SectionCard } from '@/shared/ui/kit';

/* Унифицированная страница для блоков, представленных в карте, но ещё не
   доведённых до pixel-perfect. Не «нет данных», а «вот что здесь будет» —
   умное пустое состояние со ссылкой на ФТ. */

export function Placeholder(props: { title: string; ft: string; bullets: string[]; cta?: { label: string; to: string } }) {
  const navigate = useNavigate();
  return (
    <div className="pmrk-page">
      <PageHeader title={props.title} subtitle={`Блок представлен в карте прототипа · ${props.ft}`} breadcrumbs={[{ label: 'Командный центр', to: '/' }, { label: props.title }]} />
      <SectionCard title="Что здесь будет">
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 14 }}>
          {props.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        {props.cta && (
          <div style={{ marginTop: 16 }}>
            <Button size="s" label={props.cta.label} onClick={() => navigate(props.cta!.to)} />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="pmrk-page">
      <div className="pmrk-empty" style={{ paddingTop: 80 }}>
        <div style={{ fontSize: 48, opacity: 0.3 }}>404</div>
        <div style={{ fontWeight: 600, color: 'var(--color-typo-primary)' }}>Страница не найдена</div>
        <div>Проверьте адрес или воспользуйтесь поиском (Ctrl K).</div>
        <Button size="s" label="На командный центр" onClick={() => navigate('/')} />
      </div>
    </div>
  );
}
