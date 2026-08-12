import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { AppShell } from './AppShell';
import { Home } from '@/pages/Home';
import { CommandCenter } from '@/pages/CommandCenter';
import { CounterpartyRequest } from '@/pages/CounterpartyRequest';
import { Registry } from '@/pages/Registry';
import { CounterpartyProfile } from '@/pages/CounterpartyProfile';
import { CounterpartyReport } from '@/pages/CounterpartyReport';
import { SparkProfileReport } from '@/pages/SparkProfileReport';
import { EgrulExtract, SparkRisksReport } from '@/pages/ExtraReports';
import { ProfileVersions } from '@/pages/ProfileVersions';
import { AssessmentJournal, AssessmentCreate, AssessmentForm, MassAssessment } from '@/pages/Assessment';
import { LimitRequestRegistry, LimitRequestCreate, LimitRequestPage } from '@/pages/LimitRequest';
import { Protocols } from '@/pages/Protocols';
import { NotificationFeed, Subscriptions, Tasks, Favorites } from '@/pages/Monitoring';
import { Reports } from '@/pages/Reports';
import { ProfileReportRequest, ForeignReportRequest, AffiliationReportRequest, RelatedPartiesRequest } from '@/pages/ReportForms';
import { Help } from '@/pages/Help';
import { Admin } from '@/pages/Admin';
import { NotFound } from '@/pages/Placeholder';

function RedirectToTab() {
  const { uid } = useParams();
  return <Navigate to={`/counterparties/${uid}/general`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      // Главная — поиск контрагента; портфель вынесен в отдельный «Командный центр».
      { index: true, element: <Home /> },
      { path: 'command-center', element: <CommandCenter /> },

      { path: 'registry', element: <Registry /> },
      { path: 'registry/:view', element: <Registry /> },

      // Статический сегмент стоит перед :uid — заявка на карточку, а не профиль «request».
      { path: 'counterparties/request', element: <CounterpartyRequest /> },
      { path: 'counterparties/:uid', element: <RedirectToTab /> },
      { path: 'counterparties/:uid/versions', element: <ProfileVersions /> },
      { path: 'counterparties/:uid/:tab', element: <CounterpartyProfile /> },

      { path: 'assessments', element: <AssessmentJournal /> },
      { path: 'assessments/new', element: <AssessmentCreate /> },
      { path: 'assessments/mass', element: <MassAssessment /> },
      { path: 'assessments/:id', element: <AssessmentForm /> },

      { path: 'limit-requests', element: <LimitRequestRegistry /> },
      { path: 'limit-requests/new', element: <LimitRequestCreate /> },
      { path: 'limit-requests/:id', element: <LimitRequestPage /> },

      { path: 'protocols', element: <Protocols /> },

      { path: 'notifications', element: <NotificationFeed /> },
      { path: 'subscriptions', element: <Subscriptions /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'favorites', element: <Favorites /> },
      { path: 'reports', element: <Reports /> },
      { path: 'reports/profile-rf', element: <ProfileReportRequest /> },
      { path: 'reports/foreign', element: <ForeignReportRequest /> },
      { path: 'reports/affiliation', element: <AffiliationReportRequest /> },
      { path: 'reports/related-parties', element: <RelatedPartiesRequest /> },
      { path: 'help', element: <Help /> },

      { path: 'admin', element: <Admin /> },
      { path: 'admin/*', element: <Admin /> },

      { path: '*', element: <NotFound /> },
    ],
  },

  // Скачиваемый профиль — вне оболочки приложения (чистая страница для печати в PDF)
  { path: '/report/:uid', element: <CounterpartyReport /> },
  { path: '/report/:uid/spark', element: <SparkProfileReport /> },
  { path: '/report/:uid/egrul', element: <EgrulExtract /> },
  { path: '/report/:uid/spark-risks', element: <SparkRisksReport /> },
], {
  // На GitHub Pages приложение живёт в подпапке /<repo>/ — роутер должен отбрасывать
  // этот префикс, иначе ни один маршрут не совпадёт. Локально BASE_URL = '/' → ''.
  basename: import.meta.env.BASE_URL.replace(/\/$/, ''),
});
