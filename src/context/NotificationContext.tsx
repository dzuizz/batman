'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '@/components/ui/notification';

type NotificationType = 'default' | 'critical' | 'warning' | 'success';

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Array<{
        id: number;
        message: string;
        type: NotificationType;
    }>>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'default') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(notification => notification.id !== id));
        }, 5000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        message={notification.message}
                        variant={notification.type}
                        onClose={() => setNotifications(prev =>
                            prev.filter(n => n.id !== notification.id)
                        )}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};