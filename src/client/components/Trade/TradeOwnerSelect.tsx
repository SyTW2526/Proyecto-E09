import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Opt = { value: string; label: string };

export default function TradeOwnerSelect({
  value,
  options,
  placeholder = 'Selecciona…',
  onChange,
}: {
  value: string;
  options: Opt[];
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? '';
  }, [options, value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="tradeSelectWrap" ref={wrapRef}>
      <button
        type="button"
        className="tradeSelectTrigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`tradeSelectValue ${value ? '' : 'isPlaceholder'}`}>
          {value ? selectedLabel : placeholder}
        </span>
        <span className="tradeSelectChevron">
          <ChevronDown size={18} />
        </span>
      </button>

      {open && (
        <div className="tradeSelectPopover" role="listbox">
          <div className="tradeSelectList">
            {options.length === 0 ? (
              <div className="tradeSelectEmpty">Sin usuarios</div>
            ) : (
              options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={
                    'tradeSelectItem' + (o.value === value ? ' isActive' : '')
                  }
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
