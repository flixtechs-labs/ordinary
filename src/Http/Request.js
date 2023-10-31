import { make } from 'simple-body-validator';
import { ValidationError } from '../Error/ValidationError.js';
import collect from 'collect.js';

export default class {
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
        const validator = make(attributes, this.rules()).setCustomMessages(
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
