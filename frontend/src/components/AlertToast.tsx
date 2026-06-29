import { X, Bell } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';

export default function AlertToast() {
  const { alerts, dismissAlert, unreadCount } = useAlerts();

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        {unreadCount > 0 && (
          <div className="relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
              {unreadCount}
            </span>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`alert-enter bg-[#1a1a2e] border-l-4 rounded-lg p-3 shadow-lg flex items-start gap-2 ${
              alert.severity === 'high' ? 'border-l-red-500' : 'border-l-amber-500'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{alert.ticker}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  alert.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">{alert.message}</p>
            </div>
            <button onClick={() => dismissAlert(alert.id)} className="text-gray-500 hover:text-white shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
