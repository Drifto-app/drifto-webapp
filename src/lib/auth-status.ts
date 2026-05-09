export interface ApiStatusBody {
    status?: string;
    success?: boolean;
    message?: string;
    data?: unknown;
    description?: string;
}

export interface ApiStatusError {
    response?: {
        status?: number;
        data?: ApiStatusBody;
    };
}

export const isInvalidAuthStatus = (status?: number | string) => {
    if (typeof status === 'number') {
        return status === 401 || status === 403;
    }

    if (typeof status !== 'string') {
        return false;
    }

    const normalizedStatus = status.toUpperCase();
    const statusCode = Number.parseInt(normalizedStatus, 10);

    return (
        statusCode === 401 ||
        statusCode === 403 ||
        normalizedStatus.includes('UNAUTHORIZED') ||
        normalizedStatus.includes('FORBIDDEN')
    );
};
