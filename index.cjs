'use strict';

var collect = require('collect.js');
var simpleBodyValidator = require('simple-body-validator');

const codes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};
const statuses = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

class ValidationError extends Error {
    constructor(errors) {
        super(codes.UNPROCESSABLE_ENTITY);
        this.errors = errors;
    }
}

class FormRequest {
    validatedAttributes = {};

    errors = {};

    attributes = {};

    static request;

    static async init(attributes) {
        const instance = new this();

        instance.attributes = attributes;

        await instance.validate(attributes);

        return instance;
    }

    rules() {
        return {};
    }

    messages() {
        return {};
    }

    async validate(attributes) {
        const validator = simpleBodyValidator.make(attributes, this.rules()).setCustomMessages(
            this.messages(),
        );

        if (!(await validator.validateAsync())) {
            throw new ValidationError(validator.errors().all());
        }

        this.validatedAttributes = collect(this.attributes).only(
            Object.keys(this.rules()),
        );
    }

    validated(...keys) {
        if (Object.keys(this.validatedAttributes).length === 0) {
            throw new Error('You must call init() before calling validated()');
        }

        if (keys.length === 0) {
            return this.validatedAttributes.all();
        }

        return this.validatedAttributes.only(keys).all();
    }

    safe() {
        if (Object.keys(this.validatedAttributes).length === 0) {
            throw new Error('You must call init() before calling safe()');
        }

        return this.validatedAttributes;
    }

    except(...keys) {
        if (Object.keys(this.validatedAttributes).length === 0) {
            throw new Error('You must call init() before calling except()');
        }
        return this.validatedAttributes
            .filter((value, key) => !keys.includes(key))
            .all();
    }

    only(...keys) {
        return this.validatedAttributes.only(keys).all();
    }

    has(key) {
        return (
            this.validatedAttributes.has(key) ||
            this.validatedAttributes.hasOwnProperty(key) ||
            this.attributes.hasOwnProperty(key)
        );
    }
}

var ordinary = (app) => (req, res, next) => {
    app.request.body = req.body;
    FormRequest.prototype.request = req;

    app.request.validate = async (rules) => {
        const validator = simpleBodyValidator.make(app.request.body, rules);

        if (!(await validator.validateAsync())) {
            throw new ValidationError(validator.errors().all());
        }

        app.request.validatedInput = collect(app.request.body).only(
            Object.keys(rules),
        );

        return app.request.validated();
    };

    app.request.validated = (...keys) => {
        if (app.request.validatedInput === undefined) {
            throw new Error(
                'You must call validate() before calling validated()',
            );
        }

        if (keys.length === 0) {
            return app.request.validatedInput.all();
        }

        return app.request.validatedInput.only(keys).all();
    };

    app.request.safe = () => {
        return app.request.validatedInput;
    };

    app.request.except = (...keys) => {
        return app.request.validatedInput.except(keys).all();
    };

    app.request.only = (...keys) => {
        return app.request.validatedInput.only(keys).all();
    };

    app.request.has = (key) => {
        return (
            app.request.validatedInput.has(key) ||
            app.request.body.hasOwnProperty(key)
        );
    };

    app.request.missing = (key) => {
        return !app.request.has(key);
    };

    app.request.input = (key, defaultValue = null) => {
        return (
            app.request.validatedInput.get(key, defaultValue) ||
            app.request.body[key] ||
            defaultValue
        );
    };

    app.request.validateWith = async (formRequest) => {
        const request = await formRequest.init(app.request.body);

        app.request.validatedInput = request.safe();

        return request;
    };

    next();
};

const remarkable = (error, req, res, next) => {
    console.log(error);
    if (error.message === codes.UNPROCESSABLE_ENTITY) {
        //if the clients expects json return json else redirect back with errors in session and old input
        if (req.accepts('json') && !req.accepts('html')) {
            return res.status(statuses.UNPROCESSABLE_ENTITY).json({
                message: error.message,
                errors: error.errors,
            });
        }

        req.session.errors = error.errors;
        req.session.old = req.body;

        return res.redirect('back');
    }

    next(error);
};

exports.Request = FormRequest;
exports.ValidationError = ValidationError;
exports.ordinary = ordinary;
exports.remarkable = remarkable;
