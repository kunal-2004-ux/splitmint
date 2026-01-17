export class AIServiceError extends Error {
    constructor(
        message: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'AIServiceError';
        Error.captureStackTrace(this, this.constructor);
    }
}
