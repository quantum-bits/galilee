'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const User = require('../models/User');

const JWT = require('jsonwebtoken');
const JWT_SECRET_KEY = 'My Super Secret Key';   // TODO: Store in config file!

exports.register = function (server, options, next) {

    function validate(decoded, request, callback) {
        console.log("JWT", decoded);
        if (decoded.hasOwnProperty('userId')) {
            User.query()
                .where('id', decoded.userId)
                .first()
                .then(user => {
                    if (user) {
                        console.log("VALID USER");
                        callback(null, true, user);
                    } else {
                        console.log("INVALID USER");
                        callback(null, false);
                    }
                })
                .catch(err => callback(err, false));
        } else {
            console.log("INVALID JWT");
            callback(null, false);
        }
    }

    function createToken(email, userId) {
        return JWT.sign(
            {userId: userId},
            JWT_SECRET_KEY,
            {algorithm: 'HS256', expiresIn: "1d"}
        );
    }

    server.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET_KEY,
        validateFunc: validate,
        verifyOptions: {algorithms: ['HS256']}
    });

    server.route([
        {
            method: 'POST',
            path: '/authenticate',
            config: {
                description: 'Authenticate user',
                cors: true
            },
            handler: function (request, reply) {
                let email = request.payload.email;
                let password = request.payload.password;
                console.log("EMAIL", email, "PASS", password);

                User.query()
                    .where('email', email)
                    .eager('permissions')
                    .first()
                    .then(user => {
                        if (user) {
                            user.checkPassword(password)
                                .then(isValid => {
                                    if (isValid) {
                                        delete user.password;       // Don't send password.
                                        reply({
                                            idToken: createToken(email, user.id),
                                            user: user
                                        });
                                    } else {
                                        reply(Boom.unauthorized('Authentication failed'));
                                    }
                                });
                        } else {
                            reply(Boom.unauthorized('Authentication failed'));
                        }
                    })
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        }
    ]);

    next();
};

exports.register.attributes = {name: 'authentication', version: '0.0.1'};
