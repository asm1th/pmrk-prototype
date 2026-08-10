import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

/* Канал «заголовок страницы → топбар оболочки».

   В каркасе СФК заголовок, хлебная крошка и действия страницы живут в ОДНОЙ
   строке топбара рядом с глобальными контролами (тема/персона/колокол) — в
   отличие от ПМРК, где `PageHeader` рисует заголовок внутри контента.

   Чтобы повторить топологию СФК 1:1, не трогая 53 страницы, `PageHeader`
   публикует свою «шапку» сюда, а SFK-оболочка читает и рисует её в топбаре.
   В скине ПМРК канал не используется (оболочка ПМРК рисует заголовок сама). */

export interface PageMeta {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

const ValueCtx = createContext<PageMeta>({});
// setter держим в отдельном контексте и стабильным (dispatch из useState),
// чтобы потребители-сеттеры (PageHeader) не перерисовывались при смене значения.
const SetCtx = createContext<(m: PageMeta) => void>(() => {});

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>({});
  return (
    <SetCtx.Provider value={setMeta}>
      <ValueCtx.Provider value={meta}>{children}</ValueCtx.Provider>
    </SetCtx.Provider>
  );
}

export function usePageMetaValue(): PageMeta {
  return useContext(ValueCtx);
}

/** Страница публикует свою шапку в топбар оболочки. Зависимости — только
    стабильные строковые ключи (без идентичности ReactNode), иначе цикл
    set→rerender→set. `actions` захватывается на момент срабатывания эффекта. */
export function useSetPageMeta(meta: PageMeta) {
  const setMeta = useContext(SetCtx);
  const titleKey = typeof meta.title === 'string' ? meta.title : '';
  const subKey = typeof meta.subtitle === 'string' ? meta.subtitle : '';
  const bcKey = JSON.stringify(meta.breadcrumbs ?? []);
  useLayoutEffect(() => {
    setMeta(meta);
    return () => setMeta({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMeta, titleKey, subKey, bcKey]);
}
