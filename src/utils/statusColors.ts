export const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'operational':
            return 'text-green-500';
        case 'abandoned':
            return 'text-red-500';
        case 'development':
            return 'text-yellow-500';
        case 'proposal':
            return 'text-blue-500';
        default:
            return 'text-red-500';
    }
}; 