'use client';

import LocationLoadingScreen from '@/components/LocationLoadingScreen';
import Dashboard from '@/components/Dashboard';
import { useLocation } from '@/context/LocationContext';
function DashboardContent() {
    const { location, isLoading, error } = useLocation();

    if (isLoading) {
        return <LocationLoadingScreen />;
    }

    if (error) {
        return null; // Error is handled in LocationLoadingScreen
    }

    if (!location) {
        return <LocationLoadingScreen />;
    }

    return <Dashboard />;
}

export default function DashboardPage() {
    return (
        <DashboardContent />
    );
}