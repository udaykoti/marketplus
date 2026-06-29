import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface Alert {
  id: string;
  ticker: string;
  message: string;
  severity: string;
  timestamp: number;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (ticker: string, message: string, severity: string) => void;
  dismissAlert: (id: string) => void;
  unreadCount: number;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((ticker: string, message: string, severity: string) => {
    const id = crypto.randomUUID();
    setAlerts((prev) => [{ id, ticker, message, severity, timestamp: Date.now() }, ...prev].slice(0, 10));

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 8000);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const unreadCount = alerts.length;

  return (
    <AlertContext.Provider value={{ alerts, addAlert, dismissAlert, unreadCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be inside AlertProvider');
  return ctx;
}
