'use client';

export default function Error({
    error,
    reset,
}: {
    error: Error;
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Something went wrong!</h2>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={reset}
            >
                Try again
            </button>
        </div>
    );
}