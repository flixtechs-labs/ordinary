import { codes } from '../config.js';

export class ValidationError extends Error {
    constructor(errors) {
        super(codes.UNPROCESSABLE_ENTITY);
        this.errors = errors;
    }
}
