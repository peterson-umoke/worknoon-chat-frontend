export function formatTime(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}