import React from 'react';
import { Dialog, DialogDescription, DialogTitle } from '../ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bug, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

interface PortalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  debugInfo?: React.ReactNode | Record<string, unknown>;
  debugTitle?: string;
  defaultDebugOpen?: boolean;
  bringToTop?: boolean;
};

/**
 * Purely functional Portal component - handles modal mechanics without visual styling.
 * Forms handle their own styling. Provides fullscreen toggle and debug functionality.
 * Usage: <Portal open={open} onOpenChange={setOpen}>...YourStyledForm...</Portal>
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
  debugInfo,
  debugTitle = 'Debug info',
  defaultDebugOpen = false,
  bringToTop = false,
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

  const overlayZ = bringToTop ? 'z-[11000]' : 'z-[9999]';
  const contentZ = bringToTop ? 'z-[11001]' : 'z-[10000]';
  const overlayClass = bringToTop
    ? 'fixed inset-0 bg-background/60 backdrop-blur-md ' + overlayZ
    : 'fixed inset-0 bg-transparent ' + overlayZ;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay for modal behavior, optionally blurred and semi-transparent */}
        <DialogPrimitive.Overlay className={overlayClass} />
        <DialogPrimitive.Content
          className={`fixed left-1/2 top-1/2 ${contentZ} -translate-x-1/2 -translate-y-1/2 outline-none bg-background rounded-xl shadow-lg ${isFullscreen ? 'h-screen max-h-screen w-screen' : maxWidth} ${className}`}
          style={isFullscreen ? { minHeight: '100vh', width: '100vw', left: '0', top: '0', transform: 'none', borderRadius: 0 } : undefined}
        >
        {/* Hidden accessibility elements */}
        {title && <DialogTitle className="sr-only">{title}</DialogTitle>}
        <DialogDescription className="sr-only">
          {title ? `Content for ${title}` : 'Modal content'}
        </DialogDescription>

        {/* Functional controls - positioned absolutely if needed */}
        {(onToggleFullscreen || hasDebugInfo) && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
            {hasDebugInfo && (
              <button
                type="button"
                aria-label={debugOpen ? 'Hide debug information' : 'Show debug information'}
                aria-expanded={debugOpen}
                aria-controls={debugPanelId}
                onClick={() => setDebugOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-background/80 backdrop-blur-sm"
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
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors bg-background/80 backdrop-blur-sm"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            )}
          </div>
        )}

        {/* Pure content - no container styling */}
        {children}

        {/* Debug panel - positioned absolutely if open */}
        {hasDebugInfo && (
          <div
            id={debugPanelId}
            hidden={!debugOpen}
            className="fixed bottom-4 left-4 right-4 max-w-md rounded-lg border border-border bg-muted px-4 py-3 space-y-3 text-xs text-muted-foreground backdrop-blur-sm"
          >
            <p className="font-semibold uppercase tracking-wide">{debugTitle}</p>
            {debugContent}
          </div>
        )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
