'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ProfilePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        setIsLoading(true);
        // Add logout logic here
        window.location.href = '/';
    };

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-violet-950 dark:text-violet-100">Profile Settings</h1>
                <p className="text-violet-700 dark:text-violet-300 mt-1">
                    Manage your account preferences and settings
                </p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                {/* Theme Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-violet-500" />
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-violet-950 dark:text-violet-100">Theme Mode</p>
                                <p className="text-sm text-violet-700 dark:text-violet-300">
                                    Choose between light, dark, and system mode
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={toggleTheme}
                                className="h-10 w-10 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900"
                            >
                                {mounted && (theme === 'dark' ? (
                                    <Sun className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                ) : theme === 'light' ? (
                                    <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                ) : (
                                    <Monitor className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                ))}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-violet-500" />
                            Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="font-medium text-violet-950 dark:text-violet-100">Email</p>
                            <p className="text-sm text-violet-700 dark:text-violet-300">admin@mahakam.ai</p>
                        </div>
                        <div>
                            <p className="font-medium text-violet-950 dark:text-violet-100">Role</p>
                            <p className="text-sm text-violet-700 dark:text-violet-300">Administrator</p>
                        </div>
                        <div>
                            <p className="font-medium text-violet-950 dark:text-violet-100">Last Login</p>
                            <p className="text-sm text-violet-700 dark:text-violet-300">
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            disabled={isLoading}
                            variant="destructive"
                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            {isLoading ? 'Logging out...' : 'Log Out'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 