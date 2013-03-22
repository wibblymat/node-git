/* global describe, it, before, after *///, beforeEach, afterEach */
"use strict";

var git    = require("../lib/git"),
	tmp    = require("tmp"),
	rimraf = require("rimraf"),
	fs     = require("fs"),
	path   = require("path"),
	assert = require("chai").assert;

describe("clean", function () {
	var repo, newFile, newDir;

	before(function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			repo = tmpDir;

			git.clone("test/fixtures/small-repo", tmpDir)
				.then(function () {
					newFile = path.resolve(repo, "new-file");
					newDir = path.resolve(repo, "new-dir");
					done();
				})
				.done();
		});
	});

	after(function () {
		rimraf.sync(repo);
	});

	it("is a function", function () {
		assert.isFunction(git.clean);
	});

	it("returns a promise", function () {
		var promise = git.clean(repo);
		assert.isFunction(promise.then);
		promise.done();
	});

	it("removes untracked files", function (done) {
		fs.writeFileSync(newFile);
		assert.ok(fs.existsSync(newFile));
		git.clean(repo)
			.then(function () {
				assert.ok(!fs.existsSync(newFile));
			})
			.finally(done)
			.done();
	});

	it("leaves untracked directories", function (done) {
		fs.mkdirSync(newDir);
		assert.ok(fs.existsSync(newDir));
		git.clean(repo)
			.then(function () {
				assert.ok(fs.existsSync(newDir));
			})
			.finally(done)
			.done();
	});

	it("...unless you pass the 'directories' flag", function (done) {
		assert.ok(fs.existsSync(newDir));
		git.clean(repo, {directories: true})
			.then(function () {
				assert.ok(!fs.existsSync(newDir));
			})
			.finally(done)
			.done();
	});
});
