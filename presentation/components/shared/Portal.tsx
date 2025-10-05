import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Bug, ChevronDown, Maximize2, Minimize2, X } from 'lucide-react';

interface PortalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  adminControls?: React.ReactNode;
  debugInfo?: React.ReactNode | Record<string, unknown>;
  debugTitle?: string;
  defaultDebugOpen?: boolean;
};

/**
 * Shared Portal component for full-screen or large overlay forms.
 * Usage: <Portal open={open} onOpenChange={setOpen} title="Edit Project">...</Portal>
 */
export function Portal({
  open,
  onOpenChange,
  title,
  children,
  maxWidth = 'max-w-2xl',
  className = '',
  isFullscreen = false,
  onToggleFullscreen,
  adminControls,
  debugInfo,
  debugTitle = 'Debug info',
  defaultDebugOpen = false,
}: PortalProps) {
  const hasDebugInfo = debugInfo !== undefined && debugInfo !== null;
  const [debugOpen, setDebugOpen] = React.useState(() => defaultDebugOpen && hasDebugInfo);
  const debugPanelId = React.useId();

  React.useEffect(() => {
    if (!hasDebugInfo) {
      setDebugOpen(false);
      return;
    }
    setDebugOpen(defaultDebugOpen);
  }, [defaultDebugOpen, hasDebugInfo]);

  const debugContent = React.useMemo<React.ReactNode>(() => {
    if (!hasDebugInfo || debugInfo === undefined || debugInfo === null) {
      return null;
    }

    if (React.isValidElement(debugInfo)) {
      return debugInfo;
    }

    const value = debugInfo as unknown;

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return (
        <pre className="font-mono whitespace-pre-wrap break-words">{String(value)}</pre>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1 font-mono">
          {value.map((item, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              {typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
                ? String(item)
                : JSON.stringify(item, null, 2)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return (
        <dl className="space-y-2 font-mono">
          {Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => (
            <div key={key} className="grid gap-1">
              <dt className="uppercase tracking-wide text-[10px] text-slate-500 dark:text-slate-400">{key}</dt>
              <dd className="whitespace-pre-wrap break-words">
                {typeof entryValue === 'string' || typeof entryValue === 'number' || typeof entryValue === 'boolean'
                  ? String(entryValue)
                  : JSON.stringify(entryValue, null, 2)}
              </dd>
            </div>
          ))}
        </dl>
      );
    }

    return null;
  }, [debugInfo, hasDebugInfo]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`w-full border border-white/20 dark:border-slate-800/60 ${isFullscreen ? 'h-screen max-h-screen rounded-none' : `h-[90vh] ${maxWidth} max-h-[90vh] rounded-2xl`} overflow-y-auto shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg p-0 ${className}`}
        style={isFullscreen ? { minHeight: '100vh' } : { minHeight: '400px' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-transparent">
          <div className="flex items-center gap-2">
            {title && (
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</DialogTitle>
            )}
          </div>
          <div className="flex items-center gap-1">
            {adminControls && (
              <div className="flex items-center gap-2 mr-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                {adminControls}
              </div>
            )}
            {hasDebugInfo && (
              <button
                type="button"
                aria-label={debugOpen ? 'Hide debug information' : 'Show debug information'}
                aria-expanded={debugOpen}
                aria-controls={debugPanelId}
                onClick={() => setDebugOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              >
                <Bug className="h-4 w-4" />
                <ChevronDown className={`h-4 w-4 transition-transform ${debugOpen ? 'rotate-180' : ''}`} />
              </button>
            )}
            {onToggleFullscreen && (
              <button
                type="button"
                aria-label={isFullscreen ? 'Minimize' : 'Fullscreen'}
                onClick={onToggleFullscreen}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 pt-2 space-y-4">
          <div>{children}</div>
          {hasDebugInfo && (
            <div
              id={debugPanelId}
              hidden={!debugOpen}
              className="rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3 space-y-3 text-xs text-slate-600 dark:text-slate-300"
            >
              <p className="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{debugTitle}</p>
              {debugContent}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
