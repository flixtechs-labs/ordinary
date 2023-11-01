import { default as collect } from 'collect.js';
import FormRequest from './Http/Request.js';
import { ValidationError } from './Error/ValidationError.js';
import { make } from 'simple-body-validator';

export default (app) => (req, res, next) => {
    app.request.body = req.body;
    FormRequest.prototype.request = req;

    app.request.validate = async (rules) => {
        const validator = make(app.request.body, rules);

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
