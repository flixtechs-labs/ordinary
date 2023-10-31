import FormRequest from '../src/Http/Request.js';
import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import { codes } from '../src/config.js';

const MockRequest = class extends FormRequest {
    rules() {
        return {
            name: 'required|string|max:255|min:3',
            email: 'required|string|max:255|min:3',
        };
    }
};

describe('Http/Request', () => {
    describe('#init', () => {
        it('should validate the attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.validated()).to.have.all.keys('name', 'email');
        });

        it('should throw an error if the attributes are invalid', async () => {
            try {
                await MockRequest.init({
                    name: faker.person.fullName(),
                });
            } catch (error) {
                expect(error).to.be.an('error');
                expect(error.message).to.be.equal(codes.UNPROCESSABLE_ENTITY);
            }
        });
    });

    describe('#validated', () => {
        it('should return all validated attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.validated()).to.have.all.keys('name', 'email');
        });

        it('should return only the validated safe attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            });

            expect(request.validated())
                .to.have.all.keys('name', 'email')
                .but.not.have.key('password');
        });

        it('should return only the requested attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.validated('name'))
                .to.have.all.keys('name')
                .but.not.have.keys('email');
        });

        it('should throw an error if init() has not been called', () => {
            const request = new MockRequest();

            expect(() => request.validated()).to.throw();
        });
    });

    describe('#safe', () => {
        it('should return all validated attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.safe().all()).to.have.all.keys('name', 'email');
        });

        it('should return only the validated safe attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            });

            expect(request.safe().all())
                .to.have.all.keys('name', 'email')
                .but.not.have.key('password');
        });

        it('should throw an error if init() has not been called', () => {
            const request = new MockRequest();

            expect(() => request.safe()).to.throw();
        });
    });

    describe('#except', () => {
        it('should return all validated attributes except the given ones', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.except('name'))
                .to.have.all.keys('email')
                .but.not.have.key('name');
        });

        it('should throw an error if init() has not been called', () => {
            const request = new MockRequest();

            expect(() => request.except()).to.throw();
        });

        it('should not return the given attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.except('name'))
                .to.have.all.keys('email')
                .but.not.have.key('name');
        });
    });

    describe('#only', () => {
        it('should return only the given attributes', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.only('name'))
                .to.have.all.keys('name')
                .but.not.have.key('email');
        });

        it('should throw an error if init() has not been called', () => {
            const request = new MockRequest();

            expect(() => request.only()).to.throw();
        });

        it('should not return any attributes not given', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.only('name'))
                .to.have.all.keys('name')
                .but.not.have.key('email');
        });
    });

    describe('#has', () => {
        it('should return true if the given key exists', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.has('name')).to.be.true;
        });

        it('should return false if the given key does not exist', async () => {
            const request = await MockRequest.init({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            });

            expect(request.has('password')).to.be.false;
        });
    });
});
