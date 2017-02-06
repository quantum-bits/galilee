'use strict';

const Boom = require('boom');
const Joi = require('Joi');

const moment = require('moment');
const _ = require('lodash');

const Question = require('../models/Question');

exports.register = function (server, options, next) {

    server.method('getQuestion', function (questionId, next) {
        Question.query()
            .findById(questionId)
            .then(question => next(null, question))
            .catch(err => next(err, null));
    });

    server.route([

        {
            method: 'POST',
            path: '/questions',
            config: {
                description: 'New daily question',
                auth: 'jwt',
                validate: {
                    payload: {
                        readingDayId: Joi.number().integer().min(1).required().description('Reading day ID'),
                        seq: Joi.number().integer().min(0).required().description('Sequence number'),
                        text: Joi.string().required().description('Question text')
                    }
                }
            },
            handler: function (request, reply) {
                Question.query()
                    .insert({
                        text: request.payload.text,
                        seq: request.payload.seq,
                        readingDayId: request.payload.readingDayId
                    })
                    .returning('*')
                    .then(question => reply(question))
                    .catch(err => reply(Boom.badImplementation(err)));
            }
        },

        {
            method: 'GET',
            path: '/questions/{id}',
            config: {
                description: 'Fetch a question',
                auth: 'jwt',
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required().description('Question ID'),
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    reply(request.pre.question);
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        },

        {
            method: 'PATCH',
            path: '/questions/{id}',
            config: {
                description: 'Update a question',
                auth: 'jwt',
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required().description('Question ID'),
                    },
                    payload: {
                        readingDayId: Joi.number().integer().min(1).required().description('Reading day ID'),
                        seq: Joi.number().integer().min(0).required().description('Sequence number'),
                        text: Joi.string().required().description('Question text')
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    request.pre.question.$query()
                        .updateAndFetch({
                            text: request.payload.text,
                            seq: request.payload.seq,
                            readingDayId: request.payload.readingDayId
                        })
                        .then(question => reply(question))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        },

        {
            method: 'DELETE',
            path: '/questions/{id}',
            config: {
                description: 'Delete a question',
                auth: 'jwt',
                pre: [
                    {assign: 'question', method: 'getQuestion(params.id)'}
                ],
                validate: {
                    params: {
                        id: Joi.number().integer().min(1).required().description('Question ID'),
                    }
                }
            },
            handler: function (request, reply) {
                if (request.pre.question) {
                    Question.query()
                        .deleteById(request.params.id)
                        .then(result => reply(result))
                        .catch(err => reply(Boom.badImplementation(err)));
                } else {
                    reply(Boom.notFound(`No question with ID ${request.params.id}`));
                }
            }
        }

    ]);

    next();
};

exports.register.attributes = {name: 'reading', version: '0.0.1'};
