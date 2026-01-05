/**
 * @file TradeOwnerSelect.tsx
 * @description Dropdown select personalizado para seleccionar propietario en trading
 *
 * Componente select reutilizable que aparece en los modales de trading.
 * Permite seleccionar a quién ofrecer/recibir cartas en un intercambio.
 *
 * **Características principales:**
 * - Dropdown customizado (no HTML nativo)
 * - Muestra usuario seleccionado + chevron
 * - Placeholder cuando no hay selección
 * - Popover que sale hacia abajo
 * - Cierre con click outside o Escape
 * - Opciones con diseño específico para trading
 * - Indicador visual de opción activa
 * - Cantidad de copias disponibles en label (ej: "4 units")
 *
 * **Props:**
 * - value: Valor seleccionado (username)
 * - options: Array de {value, label} opciones
 * - placeholder: Texto cuando no hay selección (default: "Selecciona…")
 * - onChange: Callback cuando cambia selección
 *
 * **Tipos Option:**
 * - value: Username del propietario
 * - label: Texto visible (ej: "@usuario · 3 units" o "@usuario")
 *
 * **Comportamiento:**
 * - Click botón: Abre/cierra popover
 * - Click opción: Selecciona y cierra
 * - Click fuera: Cierra popover
 * - Escape key: Cierra popover
 * - Sin opciones: Muestra "Sin usuarios"
 *
 * **Estados:**
 * - open: Popover abierto/cerrado
 * - value: Username seleccionado
 * - selectedLabel: Label a mostrar (calculado desde options)
 *
 * **Estilos (CSS):**
 * - tradeSelectWrap: Contenedor relativo
 * - tradeSelectTrigger: Botón principal
 * - tradeSelectValue: Texto valor (gris si placeholder)
 * - tradeSelectChevron: Icono chevron
 * - tradeSelectPopover: Dropdown panel (z-index alto)
 * - tradeSelectList: Lista de opciones
 * - tradeSelectItem: Opción individual
 * - isActive: Clase cuando está seleccionado
 * - isPlaceholder: Clase cuando muestra placeholder
 * - tradeSelectEmpty: Texto cuando no hay opciones
 *
 * **Integración:**
 * - Usado en: TradeMessageModal, TradeOfferCardModal
 * - Lucide-react para icono chevron
 * - Sin dependencias de librerías de select externas
 * - Estilos en trade_modals.css
 *
 * **Accesibilidad:**
 * - role="listbox" en popover
 * - Keyboard navigation (Escape)
 * - Click outside handling
 * - Semanticidad de button
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires lucide-react (ChevronDown icon)
 * @module client/components/Trade/TradeOwnerSelect
 * @see TradeMessageModal.tsx
 * @see TradeOfferCardModal.tsx
 */

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
