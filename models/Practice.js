'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            applications: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Application',
                join: {
                    from: 'practice.id',
                    to: 'application.practiceId'
                }
            },
            readings: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'practice.id',
                    through: {
                        from: 'application.practiceId',
                        to: 'application.readingId',
                    },
                    to: 'reading.id'
                }
            }
        }
    }

}

module.exports = Practice;
