import './globals.css'
import { Providers } from '@/components/Providers';
import { Kanit } from 'next/font/google';
import { NotificationProvider } from '@/context/NotificationContext';

const kanit = Kanit({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${kanit.className} text-black dark:text-slate-300 bg-white dark:bg-black`}>
                <NotificationProvider>
                    <Providers>
                        {children}
                    </Providers>
                </NotificationProvider>
            </body>
        </html>
    );
}