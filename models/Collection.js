'use strict';

const db = require('../db');

class Collection extends db.Model {
    static get tableName() {
        return 'collection';
    }

    allResources() {
        return this.resources.map(resource => {
            return {
                description: resource.description,
                url: resource.url,
                copyright_year: resource.copyright_year,
                copyright_owner: resource.copyright_owner,
                tags: resource.tags.map(tag => tag.title)
            }
        })
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'collection_resource.collection_id',
                        to: 'collection_resource.resource_id'
                    },
                    to: 'resource.id'
                }
            },
            pericopes: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Pericope',
                join: {
                    from: 'collection.id',
                    through: {
                        from: 'pericope_collection.collection_id',
                        to: 'pericope_collection.pericope_id',
                        extra: ['advice']
                    },
                    to: 'pericope.id'
                }
            }
        }
    }

}

module.exports = Collection;
