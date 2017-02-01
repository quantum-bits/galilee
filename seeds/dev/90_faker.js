'use strict';

const Debug = require('debug');
const debug = Debug('seed:debug');
const log = Debug('seed:log');

const random = require('random-js')();
const faker = require('faker');
const _ = require('lodash');

const User = require('../../models/User');
const Version = require('../../models/Version');
const UserTag = require('../../models/UserTag');

// Configure seed data generation.
const JOINED_DAYS_AGO = 60;
const NUM_USERS = 10;
const MIN_ENTRIES_PER_USER = 10;
const MAX_ENTRIES_PER_USER = 25;
const MIN_TAGS_PER_USER = 3;
const MAX_TAGS_PER_USER = 10;
const MAX_TAGS_PER_ENTRY = 5;

const versionData = [
    {code: 'ESV', title: 'English Standard Version'},
    {code: 'KJV', title: 'King James Version'},
    {code: 'NASB', title: 'New American Standard Version'},
    {code: 'NIV', title: 'New International Version'},
    {code: 'NKJV', title: 'New King James Version'},
    {code: 'RSV', title: 'Revised Standard Version'}
];
let versionObjects = [];

function seedVersions() {
    return Promise.all(versionData.map(datum =>
        Version.query().where('code', datum.code).first().then(result => {
            debug("Result %o", result);
            if (result) {
                // Already have this one in the database. Returning 'v' is
                // equivalent to returning a resolved promise.
                debug("Already have %o", result);
                return result;
            } else {
                // Don't have this one. Spin up an insertion and return
                // a promise.
                debug("Must insert %s", datum.code);
                return Version.query().insertAndFetch(datum);
            }
        }).then(version => {
            // There are two cases for the previous promise:
            //  1. The promise was resolved by an existing version in the DB,
            //     in which case this 'then' resolved trivially.
            //  2. The promise from the insert was resolved by this then.
            // In either case, we now have a version object form the database
            // and can insert it into the list of all versions.
            //
            // Even if the insert failed, we should be okay, because the
            // catch clause will pick it up.
            debug("Adding %o", version)
            versionObjects.push(version);
        }).catch(err => {
            console.error("ERR", err);
        })
    ));
}

function seedUsers() {
    return Promise.all(_.times(NUM_USERS, n =>
        User.query().insert({
            email: faker.internet.email(),
            password: faker.internet.password(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            joinedOn: faker.date.recent(JOINED_DAYS_AGO),
            preferredVersionId: random.pick(versionObjects).id
        })
    ))
}

function seedJournalEntries() {
    let today = new Date();

    // The map method will wait for all the promises returned by the insert operation.
    return User.query().map(user => {

        // Generate the random number of journal entries for this user.
        let entryCount = random.integer(MIN_ENTRIES_PER_USER, MAX_ENTRIES_PER_USER);

        // Generate a list of randomly many, unique, random tags for this user.
        let userTags = _.uniq(_.times(random.integer(MIN_TAGS_PER_USER, MAX_TAGS_PER_USER), n => faker.random.word()));
        log("Tags are %o", userTags);

        // Insert the user's tag list into the database.
        return Promise.all(userTags.map(tag =>
            UserTag.query().insert({
                userId: user.id,
                tag: tag
            })
        )).then(userTagObjects => {

            // Create multiple journal entries for this user.
            return Promise.all(_.times(entryCount, n => {
                // Set entry's create and update dates.
                let createDate = faker.date.recent(JOINED_DAYS_AGO);
                let updateDate = createDate;
                if (random.bool(2, 5)) {
                    // Sometimes change the update date.
                    updateDate = faker.date.between(createDate, today);
                }

                // Insert one journal entry.
                return user.$relatedQuery('journalEntries').insert({
                    title: faker.lorem.sentence(),
                    entry: faker.lorem.paragraphs(),
                    createdAt: createDate,
                    updatedAt: updateDate
                }).then(journalEntry => {
                    // Sample the user's tag objects to use for this entry.
                    let entryTagObjects =
                        random.sample(
                            userTagObjects,
                            random.integer(0, Math.min(userTagObjects.length, MAX_TAGS_PER_ENTRY)));

                    // Relate the journal entry to the tags.
                    return Promise.all(entryTagObjects.map(tagObject =>
                        journalEntry.$relatedQuery('tags').relate(tagObject)));
                });
            }));
        });
    });
}

// Seed All the Things.
exports.seed = function (knex, Promise) {
    return seedVersions().then(() => {
        return seedUsers();
    }).then(() => {
        return seedJournalEntries();
    }).then(
        () => log("SUCCESS"),
        err => console.error("FAIL", err));
};
