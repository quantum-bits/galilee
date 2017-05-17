'use strict';

/**
 * Set-up code for HAPI testing.  Use it like this:
 *
 * import { initTest, expect, server, db } from './support';
 * lab = exports.lab = initTest();
 *
 * lab.experiment(...);
 *
 * Apparently, hapi-lab requires that the test file itself export
 * the lab object itself to run properly.
 */

const Hoek = require('hoek');

const Lab = require('lab');

const Code = require('code');
exports.expect = Code.expect;

const Server = require('../server');
exports.server = null;

exports.initTest = function() {
    const lab = Lab.script();

    lab.before((done) => {
	console.log("Initialize Server Start!");
        Server.initializeServer((err, server) => {
            if (err) {
                Hoek.assert(!err, err);
            }
	    console.log("Initialize Server Middle!");
            server.initialize(err => {
                Hoek.assert(!err, err);
            });
            exports.server = server;
            server.log("Server initialized");
            done();
        })
	console.log("Initialize Server End!");
    });

    return lab;
};

exports.db = require('../db');
