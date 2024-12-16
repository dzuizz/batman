// utils/statusColors.ts
const getStatusColor = (status: string) => {
    const lowercaseStatus = status.toLowerCase();

    switch (lowercaseStatus) {
        case 'operational':
            return 'px-2 py-1 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
        case 'maintenance':
            return 'px-2 py-1 rounded-full text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
        case 'development':
            return 'px-2 py-1 rounded-full text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30';
        case 'proposal':
            return 'px-2 py-1 rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30';
        case 'abandoned':
            return 'px-2 py-1 rounded-full text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';
        default:
            return 'px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/30';
    }
};

export default getStatusColor;