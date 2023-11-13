import request from 'supertest';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import express from 'express';
import session from 'express-session';
import { ordinary, remarkable, ValidationError } from '../index.js';

let app;

beforeEach((done) => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
    }));
    app.use(ordinary(app));
    done();
});

describe('ordinary validation package express middleware', () => {
    it('should validate the request', (done) => {
        app.post('/test', async (req, res) => {
            await req.validate({
                name: 'required|string|max:255|min:3',
                email: 'required|string|max:255|min:3',
            });

            res.send(req.body);
        });

        request(app)
            .post('/test')
            .send({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            })
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.all.keys('name', 'email');
                if (err) return done(err);
                return done();
            });
    });

    it('should throw an error if the request is invalid', (done) => {
        app.post('/test', async (req, res) => {
            try {
                await req.validate({
                    name: 'required|string|max:255|min:3',
                    email: 'required|string|max:255|min:3',
                });
            } catch (error) {
                res.status(422).send(error.message);
            }
        });

        request(app)
            .post('/test')
            .send({
                name: faker.person.fullName(),
            })
            .expect(422)
            .end((err, res) => {
                if (err) return done(err);
                return done();
            });
    });

    it('should return all validated attributes', (done) => {
        app.post('/test', async (req, res) => {
            await req.validate({
                name: 'required|string|max:255|min:3',
                email: 'required|string|max:255|min:3',
            });

            res.send(req.validated());
        });

        request(app)
            .post('/test')
            .send({
                name: faker.person.fullName(),
                email: faker.internet.email(),
            })
            .expect(200)
            .end((err, res) => {
                expect(res.body).to.have.all.keys('name', 'email');
                if (err) return done(err);
                return done();
            });
    });
});
