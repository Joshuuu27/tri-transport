import React from "react";
import { toast, ToastContainer, Slide, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  WifiOff,
  Info,
  Loader,
  Check,
} from "lucide-react";

export type ToastStatus =
  | "success"
  | "error"
  | "warning"
  | "offline"
  | "info"
  | "pending"
  | "completed";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface StatusStyle {
  bg: string;
  icon: React.JSX.Element;
  defaultActionLabel: string;
  defaultSecondaryActionLabel?: string; // Added for multi-action defaults
  text?: string;
}

const statusStyles: Record<ToastStatus, StatusStyle> = {
  success: {
    bg: "bg-green-500",
    icon: <CheckCircle className="h-5 w-5 text-white" />,
    defaultActionLabel: "Done",
    text: "text-white",
  },
  error: {
    bg: "bg-red-500",
    icon: <XCircle className="h-5 w-5 text-white" />,
    defaultActionLabel: "Retry",
    text: "text-white",
  },
  warning: {
    bg: "bg-yellow-400",
    icon: <AlertTriangle className="h-5 w-5 text-black" />,
    defaultActionLabel: "Free Space",
    text: "text-black",
  },
  offline: {
    bg: "bg-orange-500",
    icon: <WifiOff className="h-5 w-5 text-white" />,
    defaultActionLabel: "Retry",
    defaultSecondaryActionLabel: "Check Network",
    text: "text-white",
  },
  info: {
    bg: "bg-slate-500",
    icon: <Info className="h-5 w-5 text-white" />,
    defaultActionLabel: "Update Now",
    defaultSecondaryActionLabel: "Dismiss",
    text: "text-white",
  },
  pending: {
    bg: "bg-purple-500",
    icon: <Loader className="h-5 w-5 animate-spin text-white" />,
    defaultActionLabel: "Cancel",
    defaultSecondaryActionLabel: "View Status",
    text: "text-white",
  },
  completed: {
    bg: "bg-green-600",
    icon: <Check className="h-5 w-5 text-white" />,
    defaultActionLabel: "Done",
    defaultSecondaryActionLabel: "Open File",
    text: "text-white",
  },
};

interface CustomToastProps {
  message: string;
  status: ToastStatus;
  actions?: ToastAction[];
}

const CustomToast: React.FC<CustomToastProps> = ({
  message,
  status,
  actions,
}) => {
  const styles = statusStyles[status];
  return (
    <div
      className={`flex items-center rounded-md p-4 shadow-lg ${styles.bg} ${styles.text}`}
    >
      <div
        className="mr-3 flex-shrink-0 cursor-pointer"
        onClick={() => {
          toast.dismiss();
        }}
      >
        {styles.icon}
      </div>
      <div className="min-w-0 flex-1 text-[0.925rem] font-light">{message}</div>
      {actions && actions.length > 0 && (
        <div className="ml-10 flex flex-shrink-0 flex-row items-center space-x-1.5">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                toast.dismiss();
              }}
              className={`whitespace-nowrap rounded px-4 py-1 text-sm font-medium
                ${
                  status === "warning"
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const defaultToastOptions: Partial<ToastOptions> = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: false,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  closeButton: false,
  className: "!p-0 !bg-transparent !shadow-none !w-auto max-w-md",
  // bodyClassName: "!p-0",
};

export interface ToastParams {
  type: ToastStatus;
  message: string;
  // For single action types (success, error, warning)
  actionLabel?: string;
  actionCallback?: () => void;
  // For multi-action types (offline, info, pending, completed)
  primaryActionLabel?: string;
  primaryActionCallback?: () => void;
  secondaryActionLabel?: string;
  secondaryActionCallback?: () => void;
}

export const showToast = (params: ToastParams) => {
  const { type, message } = params;
  const statusStyle = statusStyles[type];
  let actions: ToastAction[] = [];
  const defaultPrimaryCallback = () => toast.dismiss();

  const isMultiActionType = [
    "offline",
    "info",
    "pending",
    "completed",
  ].includes(type);

  if (isMultiActionType) {
    const pLabel = params.primaryActionLabel || statusStyle.defaultActionLabel;
    const pCallback = params.primaryActionCallback || defaultPrimaryCallback;
    actions.push({ label: pLabel, onClick: pCallback });

    // Add secondary action if a label is provided for it, or if it's a multi-action type and no custom primary action was given (to ensure default secondary appears)
    if (
      params.secondaryActionLabel ||
      (statusStyle.defaultSecondaryActionLabel && !params.primaryActionLabel)
    ) {
      const sLabel =
        params.secondaryActionLabel || statusStyle.defaultSecondaryActionLabel!;
      const sCallback =
        params.secondaryActionCallback || defaultPrimaryCallback;
      actions.push({ label: sLabel, onClick: sCallback });
    }
  } else {
    // Single action types
    const label = params.actionLabel || statusStyle.defaultActionLabel;
    const callback = params.actionCallback || defaultPrimaryCallback;
    actions.push({ label, onClick: callback });
  }

  toast(
    <CustomToast message={message} status={type} actions={actions} />,
    defaultToastOptions as ToastOptions
  );
};

export { ToastContainer, Slide };
