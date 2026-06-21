function sanitizeValue(value) {
    if (value == null) return value;

    if (Buffer.isBuffer(value)) {
        return `[Buffer ${value.length} bytes]`;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
    }

    if (typeof value === 'object') {
        const sanitized = {};
        for (const [key, item] of Object.entries(value)) {
            const normalizedKey = key.toLowerCase();
            if (
                normalizedKey.includes('senha') ||
                normalizedKey.includes('password') ||
                normalizedKey.includes('token') ||
                normalizedKey.includes('authorization') ||
                normalizedKey.includes('bucket_key')
            ) {
                sanitized[key] = '[REDACTED]';
                continue;
            }
            sanitized[key] = sanitizeValue(item);
        }
        return sanitized;
    }

    return value;
}

function requestContext(req) {
    if (!req) return undefined;

    return {
        method: req.method,
        originalUrl: req.originalUrl,
        params: sanitizeValue(req.params),
        query: sanitizeValue(req.query),
        body: sanitizeValue(req.body),
        user: sanitizeValue(req.user),
        files: req.files?.map((file) => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        })),
        file: req.file
            ? {
                  fieldname: req.file.fieldname,
                  originalname: req.file.originalname,
                  mimetype: req.file.mimetype,
                  size: req.file.size,
              }
            : undefined,
    };
}

function serializeError(error) {
    if (!error) return error;

    return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status,
        statusCode: error.statusCode,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        schema: error.schema,
        column: error.column,
    };
}

function logError(context, error, req) {
    console.error(
        `[ERROR] ${context}`,
        JSON.stringify(
            {
                error: serializeError(error),
                request: requestContext(req),
            },
            null,
            2,
        ),
    );
}

function logWarning(context, data = {}) {
    console.warn(`[WARN] ${context}`, JSON.stringify(sanitizeValue(data), null, 2));
}

module.exports = {
    logError,
    logWarning,
    requestContext,
    sanitizeValue,
};
