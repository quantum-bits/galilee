'use strict';

const db = require('../db');

const Promise = require('bluebird');
const bcrypt = Promise.promisifyAll(require('bcrypt'));

// Hash the password; return a promise containing the hashed password.
function hashPassword(password) {
    return bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(password, salt));
}

module.exports = class User extends db.Model {
    static get tableName() {
        return 'user';
    }

    static get relationMappings() {
        return {
            version: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Version',
                join: {
                    from: 'user.preferredVersionId',
                    to: 'version.id'
                }
            },
            permissions: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Permission',
                join: {
                    from: 'user.id',
                    through: {
                        from: 'userPermission.userId',
                        to: 'userPermission.permissionId'
                    },
                    to: 'permission.id'
                }
            },
            groups: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'user.id',
                    through: {
                        from: 'membership.userId',
                        to: 'membership.groupId'
                    },
                    to: 'group.id'
                }
            },
            journalEntries: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/JournalEntry',
                join: {
                    from: 'user.id',
                    to: 'journalEntry.userId'
                }
            },
            tags: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Tag',
                join: {
                    from: 'user.id',
                    to: 'tag.userId'
                }
            }
        }
    }

    // Check the users's password against the parameter.
    // Returns a promise with an 'isValid' value.
    checkPassword(password) {
        return bcrypt.compare(password, this.password)
    }

    // Encrypt the password before insertion into the database.
    $beforeInsert(queryContext) {
        return hashPassword(this.password).then(hash => this.password = hash);
    }

    // Encrypt the password before updating to the database.
    $beforeUpdate(opt, queryContext) {
        // Only want to do this if there is actually a password to hash. This will
        // not be the case, for example, when patching a User to change the name.
        if (this.hasOwnProperty('password')) {
            return hashPassword(this.password).then(hash => this.password = hash);
        }
    }
}
