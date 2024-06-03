export function errorToString(error: unknown): string | undefined {
    if (typeof error === 'string') {
        return error
    }
    if (error !== null && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message
    }
}