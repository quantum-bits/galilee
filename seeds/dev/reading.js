'use strict';

const uuid = require('uuid');

const ReadingDay = require('../../models/ReadingDay');

exports.seed = function (knex, Promise) {

    let today = new Date();

    return Promise.all([
        knex('application_step').del(),
        knex('step_resource').del(),
        knex('resource_tag').del()

    ]).then(() => Promise.all([
        knex('tag').del(),
        knex('step').del(),
        knex('resource').del(),
        knex('application').del()

    ])).then(() => Promise.all([
        knex('reading').del(),
        knex('daily_question').del(),
        knex('practice').del(),
        knex('resource_type').del()

    ])).then(() => Promise.all([
        knex('reading_day').del()

    ])).then(() => ReadingDay.query().insertWithRelated({
        date: today.toISOString(),
        questions: [
            { seq: 1, question: 'What is your name?' },
            { seq: 2, question: 'What is your quest?' },
            { seq: 3, question: 'What is your favorite color?' }
        ],
        readings: [
            {
                seq: 1,
                std_ref: 'Hosea 1.2-10',
                osis_ref: 'Hos.1.2-Hos.1.10',
                applications: [
                    {
                        practice: {
                            title: "Praying Scripture",
                            summary: "Summary of Praying Scripture",
                            description: "Description of Praying Scripture"
                        }
                    },
                    {
                        practice: {
                            title: "Lectio Divina",
                            summary: "Summary of Lectio Divina",
                            description: "Description of Lectio Divina"
                        },
                        steps: [
                            {
                                seq: 1,
                                description: "Reading"
                            },
                            {
                                seq: 2,
                                description: "Meditation"
                            },
                            {
                                seq: 3,
                                description: "Prayer"
                            },
                            {
                                seq: 4,
                                description: "Contemplation"
                            },
                        ],
                    },
                    {
                        practice: {
                            title: "Scripture Engagement Through Visual Art",
                            summary: "Summary of Scripture Engagement Through Visual Art",
                            description: "Description of Scripture Engagement Through Visual Art"
                        },
                        steps: [
                            {
                                seq: 1,
                                description: "Here's some art",
                                resources: [
                                    {
                                        id: uuid(),
                                        details: {
                                            filename: 'cana.png'
                                        },
                                        caption: 'Wedding at Cana',
                                        copyright_year: 2006,
                                        copyright_owner: 'Zondervan',
                                        tags: [
                                            {
                                                title: 'Miracle',
                                                "#id": 'resource-tag-miracle'
                                            },
                                            {
                                                title: 'Wedding',
                                            }
                                        ],
                                        type: {
                                            title: 'Image',
                                            icon: 'image-icon',
                                            "#id": 'resource-type-image'
                                        },
                                    }
                                ]
                            },
                            {
                                seq: 2,
                                description: "Here's some more art",
                                resources: [
                                    {
                                        id: uuid(),
                                        details: {
                                            filename: 'feeding5000.jpeg'
                                        },
                                        caption: 'Feeding 5,000',
                                        copyright_year: 2012,
                                        copyright_owner: 'Zondervan',
                                        tags: [
                                            {
                                                "#ref": 'resource-tag-miracle'
                                            },
                                            {
                                                title: 'Loaves'
                                            },
                                            {
                                                title: 'Fishes'
                                            }
                                        ],
                                        type: {
                                            "#ref": 'resource-type-image'
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
            },
            {
                seq: 2,
                std_ref: 'Psalm 85',
                osis_ref: 'Ps.85',
                applications: [
                    {
                        practice: {
                            title: "Journaling Scripture",
                            summary: "Summary of Journaling Scripture",
                            description: "Description of Journaling Scripture"
                        }
                    }
                ]
            },
            {
                seq: 3,
                std_ref: 'Colossians 2.6-15',
                osis_ref: 'Col.2.6-Col.2.15'
            }
        ]
    }))
};