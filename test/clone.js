/* global describe, it *///, before, after, beforeEach, afterEach */
"use strict";

var git    = require("../lib/git"),
	tmp    = require("tmp"),
	rimraf = require("rimraf"),
	fs     = require("fs"),
	path   = require("path"),
	assert = require("chai").assert;

describe("clone", function () {
	var failPromise = git.clone();

	it("is a function", function () {
		assert.isFunction(git.clone);
	});

	it("returns a promise", function () {
		assert.isFunction(failPromise.then);
	});

	it("fails if no arguments are passed", function (done) {
		failPromise.then(function () {
			assert(false, "A clone with no arguments unexpectedly succeeded");
			done();
		}).fail(function (error) {
			assert.ok(error);
			assert.equal(error.message, "You must specify a source and a destination for clone");
			done();
		}).done();
	});

	it("clones remote public repositories", function (done) {
		this.timeout(20000);
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.clone("git@github.com:wibblymat/node-git.git", tmpDir)
				.then(function () {
					assert.ok(fs.existsSync(path.resolve(tmpDir, "README.md")));
				})
				.finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});

	it("clones local repositories", function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.clone("test/fixtures/small-repo", tmpDir)
				.then(function () {
					assert.ok(fs.existsSync(path.resolve(tmpDir, "README")));
				})
				.finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});

	it("respects the depth option", function (done) {
		this.timeout(20000);
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.clone("git@github.com:components/jquery.git", tmpDir, {depth: 1})
				.then(function () {
					assert.ok(fs.existsSync(path.resolve(tmpDir, ".git/shallow")));
				})
				.finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});
});
