'use strict';

const db = require('../db');

module.exports = class Version extends db.Model {
    static get tableName() {
        return 'version';
    }

    static get relationMappings() {
        return {
            users: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'version.id',
                    to: 'user.preferredVersionId'
                }
            },
            passages: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Passage',
                join: {
                    from: 'version.id',
                    to: 'passage.versionId'
                }
            }
        }
    }
}
