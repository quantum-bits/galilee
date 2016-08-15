'use strict';

const db = require('../db');

class Version extends db.Model {
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
                    to: 'user.preferred_version_id'
                }
            }
        }
    }
}

module.exports = Version;
