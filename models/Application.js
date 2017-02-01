'use strict';

const db = require('../db');

class Application extends db.Model {
    static get tableName() {
        return 'application';
    }

    static get relationMappings() {
        return {
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'application.readingId',
                    to: 'reading.id'
                }
            },
            practice: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'application.practiceId',
                    to: 'practice.id'
                }
            },
            steps: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'application.id',
                    through: {
                        from: 'applicationStep.applicationId',
                        to: 'applicationStep.stepId'
                    },
                    to: 'step.id'
                }
            },
        }
    }

}

module.exports = Application;
