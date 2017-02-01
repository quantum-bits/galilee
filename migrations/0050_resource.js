'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('resourceType', table => {
            table.increments('id');
            table.string('title').notNullable();
            table.string('icon');
        }),

        knex.schema.createTableIfNotExists('resource', table => {
            table.uuid('id').primary();
            table.integer('userId').references('user.id');
            table.text('caption').notNullable();
            table.string('copyrightYear');
            table.string('copyrightOwner');
            table.jsonb('details');
            table.integer('resourceTypeId').references('resourceType.id');
        }),

        knex.schema.createTableIfNotExists('stepResource', table => {
            table.integer('stepId').references('step.id');
            table.uuid('resourceId').references('resource.id');
            table.primary(['stepId', 'resourceId']);
        }),

        knex.schema.createTableIfNotExists('tag', table => {
            table.increments('id');
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('resourceTag', table => {
            table.uuid('resourceId').references('resource.id');
            table.integer('tagId').references('tag.id');
            table.primary(['resourceId', 'tagId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('readingCollection'),
        knex.schema.dropTableIfExists('stepResource'),
        knex.schema.dropTableIfExists('resourceTag'),
        knex.schema.dropTableIfExists('tag'),
        knex.schema.dropTableIfExists('resource'),
        knex.schema.dropTableIfExists('resourceType')
    ])
};
