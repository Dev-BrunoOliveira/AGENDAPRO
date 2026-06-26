import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import "./Toast.css";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = "info") {
  const event = new CustomEvent("add-toast", { detail: { message, type } });
  window.dispatchEvent(event);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAddToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newToast: ToastMessage = {
        id: Math.random().toString(36).substr(2, 9),
        message: customEvent.detail.message,
        type: customEvent.detail.type,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    };

    window.addEventListener("add-toast", handleAddToast);
    return () => window.removeEventListener("add-toast", handleAddToast);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === "success" && <CheckCircle size={20} />}
            {t.type === "error" && <AlertCircle size={20} />}
            {t.type === "info" && <Info size={20} />}
          </div>
          <p>{t.message}</p>
          <button
            className="toast-close"
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
