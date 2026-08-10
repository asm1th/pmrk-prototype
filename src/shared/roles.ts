/* =============================================================================
   Роль-ориентированная модель доступа (табл. 13 ЕДТ, разд. 6 фронтенд-структуры,
   разд. 2 «Сквозные механизмы»). SPA только СКРЫВАЕТ элементы — истинный контроль
   на gateway/сервисах. В прототипе роль переключается тумблером в шапке.
   ========================================================================== */

export type RoleCode =
  | 'КК-ДО'
  | 'КК-Блок'
  | 'КК-УФК'
  | 'ИСП'
  | 'РУК'
  | 'ПОЛЬЗ'
  | 'СБ'
  | 'АДМ';

export interface RoleDef {
  code: RoleCode;
  title: string;
  short: string;
  /** системный код роли (08/разд. 2) */
  system: string;
  /** число исполнителей роли (табл. 13) */
  count: number;
  /** «характер работы» — опинионированные дефолты командного центра */
  profile: 'deep' | 'standard' | 'light';
  /** суточная квота массовой оценки, если ограничена */
  massQuota?: number;
}

export const ROLES: Record<RoleCode, RoleDef> = {
  'КК-ДО': { code: 'КК-ДО', title: 'Кредитный контролёр — ДО', short: 'Контролёр ДО', system: 'CONTROLLER_SUBSIDIARY', count: 158, profile: 'deep', massQuota: 50 },
  'КК-Блок': { code: 'КК-Блок', title: 'Кредитный контролёр — Блок', short: 'Контролёр Блока', system: 'CONTROLLER_BLOCK', count: 12, profile: 'deep' },
  'КК-УФК': { code: 'КК-УФК', title: 'Кредитный контролёр — УФК', short: 'Контролёр УФК', system: 'CONTROLLER_UFK', count: 9, profile: 'deep' },
  'ИСП': { code: 'ИСП', title: 'Исполнитель по договору', short: 'Исполнитель', system: 'CONTRACT_EXECUTOR', count: 57, profile: 'standard' },
  'РУК': { code: 'РУК', title: 'Руководитель исполнителя по договору', short: 'Руководитель', system: 'EXECUTOR_MANAGER', count: 5, profile: 'standard' },
  'ПОЛЬЗ': { code: 'ПОЛЬЗ', title: 'Пользователь', short: 'Пользователь', system: 'USER', count: 4926, profile: 'light' },
  'СБ': { code: 'СБ', title: 'Блок безопасности', short: 'Безопасность', system: 'SECURITY_BLOCK', count: 20, profile: 'standard', massQuota: 50 },
  'АДМ': { code: 'АДМ', title: 'Администратор портала', short: 'Администратор', system: 'ADMIN', count: 8, profile: 'deep' },
};

export const ROLE_ORDER: RoleCode[] = ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'ПОЛЬЗ', 'СБ', 'АДМ'];

/** Матрица возможностей. Ключ = «что можно», значение = роли, кому видно/доступно. */
const CAP: Record<string, RoleCode[]> = {
  // разделы меню / вкладки
  viewLimitSection: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'АДМ'], // скрыт у ПОЛЬЗ и СБ
  viewProtocols: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'АДМ'], // скрыт у ИСП/РУК/ПОЛЬЗ/СБ
  viewCommandCenter: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'СБ', 'АДМ'], // у ПОЛЬЗ портфеля нет — только главная с поиском
  viewTasks: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'СБ', 'АДМ'], // скрыт у ПОЛЬЗ
  viewSignals: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'СБ', 'АДМ'], // лента сигналов скрыта у ПОЛЬЗ — интерпретирует сам
  viewSecurityTab: ['СБ', 'КК-ДО', 'КК-Блок', 'КК-УФК', 'РУК', 'АДМ'],
  viewAdmin: ['АДМ'],
  routeDesigner: ['КК-УФК', 'АДМ'],
  // действия
  editRegistry: ['АДМ'],
  createLimitRequest: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'АДМ'],
  approveLimitRequest: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'РУК', 'СБ', 'АДМ'],
  editAssessment: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'ИСП', 'РУК', 'АДМ'], // ПОЛЬЗ/СБ — только создание
  massAssessment: ['КК-ДО', 'КК-Блок', 'КК-УФК', 'СБ', 'АДМ'],
  proposeSpecialControl: ['КК-ДО', 'КК-Блок', 'ИСП', 'СБ', 'АДМ'],
  decideSpecialControl: ['КК-Блок', 'КК-УФК', 'АДМ'],
};

export function can(role: RoleCode, capability: keyof typeof CAP): boolean {
  return CAP[capability]?.includes(role) ?? false;
}

export function isController(role: RoleCode): boolean {
  return role === 'КК-ДО' || role === 'КК-Блок' || role === 'КК-УФК';
}

/** Квота массовой оценки в сутки: undefined = без ограничений, число = лимит. */
export function massQuota(role: RoleCode): number | undefined {
  return ROLES[role].massQuota;
}
