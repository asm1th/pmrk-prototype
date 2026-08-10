import React, { useRef, useState } from 'react';
import './components.css';

/* Виртуализированная таблица FAANG-класса. Рендерит только видимое окно строк —
   спокойно держит 200 тыс. карточек (НФТ-Пр-3). Сортировка, keyboard-nav,
   inline-действия, sticky-заголовок. Реальное ПМРК: DataTable над @pmrk/ui-kit. */

export interface Column<T> {
  key: string;
  title: string;
  width?: number; // px (фиксированная)
  grow?: number; // доля растяжения
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
}

export interface SortState {
  key: string;
  dir: 'asc' | 'desc';
}

function cellStyle<T>(c: Column<T>): React.CSSProperties {
  return {
    flex: c.width ? `0 0 ${c.width}px` : `${c.grow ?? 1} 1 0`,
    textAlign: c.align ?? 'left',
    justifyContent: c.align === 'right' ? 'flex-end' : c.align === 'center' ? 'center' : 'flex-start',
  };
}

export function DataTable<T>(props: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: SortState;
  onSort?: (s: SortState) => void;
  height?: number;
  rowHeight?: number;
  rowActions?: (row: T) => React.ReactNode;
  emptyText?: string;
}) {
  const rowH = props.rowHeight ?? 40;
  const viewport = props.height ?? 520;
  const [scrollTop, setScrollTop] = useState(0);
  const [focus, setFocus] = useState(-1); // -1 = ничего не выбрано (без преселекта)
  const scrollRef = useRef<HTMLDivElement>(null);

  const total = props.rows.length;
  const overscan = 6;
  const start = Math.max(0, Math.floor(scrollTop / rowH) - overscan);
  const visible = Math.ceil(viewport / rowH) + overscan * 2;
  const end = Math.min(total, start + visible);
  const slice = props.rows.slice(start, end);

  const onHeaderClick = (c: Column<T>) => {
    if (!c.sortable || !props.onSort) return;
    const dir: 'asc' | 'desc' = props.sort?.key === c.key && props.sort.dir === 'asc' ? 'desc' : 'asc';
    props.onSort({ key: c.key, dir });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus((f) => Math.min(total - 1, f + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => Math.max(0, f - 1));
    } else if (e.key === 'Enter' && props.onRowClick && props.rows[focus]) {
      props.onRowClick(props.rows[focus]);
    }
  };

  return (
    <div className="pmrk-table" tabIndex={0} onKeyDown={onKeyDown} style={{ outline: 'none' }}>
      <div className="pmrk-table__head">
        {props.columns.map((c) => {
          const active = props.sort?.key === c.key;
          return (
            <div key={c.key} className="pmrk-th" style={cellStyle(c)} onClick={() => onHeaderClick(c)}>
              {c.title}
              {c.sortable && <span style={{ opacity: active ? 1 : 0.3 }}>{active ? (props.sort!.dir === 'asc' ? '↑' : '↓') : '↕'}</span>}
            </div>
          );
        })}
        {props.rowActions && <div className="pmrk-th" style={{ flex: '0 0 120px', cursor: 'default' }} />}
      </div>

      {total === 0 ? (
        <div className="pmrk-empty">{props.emptyText ?? 'Ничего не найдено'}</div>
      ) : (
        <div
          ref={scrollRef}
          className="pmrk-table__scroll"
          style={{ height: viewport }}
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          <div style={{ height: total * rowH, position: 'relative' }}>
            <div style={{ transform: `translateY(${start * rowH}px)` }}>
              {slice.map((row, i) => {
                const realIdx = start + i;
                return (
                  <div
                    key={props.rowKey(row)}
                    className="pmrk-tr"
                    style={{ height: rowH, background: realIdx === focus ? 'var(--color-bg-secondary)' : undefined }}
                    onClick={() => {
                      setFocus(realIdx);
                      props.onRowClick?.(row);
                    }}
                  >
                    {props.columns.map((c) => (
                      <div key={c.key} className="pmrk-td" style={{ ...cellStyle(c), display: 'flex', alignItems: 'center' }}>
                        {c.render(row)}
                      </div>
                    ))}
                    {props.rowActions && (
                      <div className="pmrk-td" style={{ flex: '0 0 120px', display: 'flex', justifyContent: 'flex-end', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        {props.rowActions(row)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', fontSize: 12, color: 'var(--color-typo-secondary)', borderTop: '1px solid var(--color-bg-border)' }}>
        <span>Показано {total.toLocaleString('ru-RU')} записей · виртуализация активна (рендерится {end - start} строк)</span>
        <span>↑/↓ — навигация, Enter — открыть</span>
      </div>
    </div>
  );
}
