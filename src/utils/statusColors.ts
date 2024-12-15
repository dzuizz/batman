// utils/statusColors.ts
export const getStatusColor = (status: string) => {
    const lowercaseStatus = status.toLowerCase();

    switch (lowercaseStatus) {
        case 'operational':
            return 'px-2 py-1 rounded-full text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
        case 'maintenance':
            return 'px-2 py-1 rounded-full text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
        case 'development':
            return 'px-2 py-1 rounded-full text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
        case 'proposal':
            return 'px-2 py-1 rounded-full text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30';
        case 'abandoned':
            return 'px-2 py-1 rounded-full text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
        default:
            return 'px-2 py-1 rounded-full text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
    }
};