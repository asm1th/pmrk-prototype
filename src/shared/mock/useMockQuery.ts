import { useEffect, useRef, useState } from 'react';

/* Имитация серверного запроса с задержкой — чтобы показать скелетоны и
   «скорость как часть дизайна» (НФТ-Пр-2). Реальное ПМРК использует RTK Query;
   здесь — лёгкая обёртка над статическими фикстурами. */

interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
}

export function useMockQuery<T>(factory: () => T, deps: unknown[] = [], delay = 420): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: true, error: undefined });
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  useEffect(() => {
    let live = true;
    setState({ data: undefined, loading: true, error: undefined });
    const t = setTimeout(() => {
      if (!live) return;
      try {
        setState({ data: factoryRef.current(), loading: false, error: undefined });
      } catch (e) {
        setState({ data: undefined, loading: false, error: (e as Error).message });
      }
    }, delay);
    return () => {
      live = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

/** Мгновенная версия — для уже загруженных списков (без скелетона). */
export function useInstant<T>(factory: () => T, deps: unknown[] = []): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [v] = useState(factory);
  return v;
}
