import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const notificationVariants = cva(
    "fixed right-4 p-4 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-3",
    {
        variants: {
            variant: {
                default: "bg-white text-gray-900 dark:bg-gray-800 dark:text-white",
                critical: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
                warning: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
                success: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
            },
            position: {
                top: "top-4",
                bottom: "bottom-4",
            }
        },
        defaultVariants: {
            variant: "default",
            position: "top"
        }
    }
);

interface NotificationProps extends VariantProps<typeof notificationVariants> {
    message: string;
    onClose?: () => void;
}

export function Notification({ message, variant, position, onClose }: NotificationProps) {
    const icons = {
        default: Info,
        critical: AlertCircle,
        warning: AlertCircle,
        success: CheckCircle,
    };

    const Icon = icons[variant || 'default'];

    return (
        <div className={cn(notificationVariants({ variant, position }))}>
            <Icon className="w-5 h-5" />
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="ml-auto">
                    <XCircle className="w-5 h-5" />
                </button>
            )}
        </div>
    );
} 