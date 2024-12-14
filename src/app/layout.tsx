import './globals.css'
import { Providers } from '@/components/Providers';
import { Kanit } from 'next/font/google';

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
            <body className={kanit.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}