import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX, FiFilter } from "react-icons/fi";

const ListingsFilterDrawer = ({
  open,
  onClose,
  title = "Filters",
  children,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/45 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-500">
              <FiFilter size={18} />
            </span>
            <h2 className="truncate text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          {children}
        </div>
      </aside>
    </div>,
    document.body,
  );
};

export default ListingsFilterDrawer;
