/* global describe, it, beforeEach *///, before, after, afterEach */
"use strict";

var git    = require("../lib/git"),
	tmp    = require("tmp"),
	rimraf = require("rimraf"),
	fs     = require("fs"),
	path   = require("path"),
	assert = require("chai").assert;

describe("checkout", function () {
	var failPromise = git.checkout(),
		root = process.cwd();

	beforeEach(function () {
		process.chdir(root);
	});

	it("is a function", function () {
		assert.isFunction(git.checkout);
	});

	it("returns a promise", function () {
		assert.isFunction(failPromise.then);
	});

	it("requires a repo to be passed", function (done) {
		failPromise
			.then(function () {
				assert(false, "A checkout with no arguments unexpectedly succeeded");
				done();
			})
			.fail(function (error) {
				assert.ok(error);
				assert.equal(error.message, "You must specify a repo and a branch or commit");
				done();
			})
			.done();
	});

	it("requires that the repo is valid", function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.checkout(tmpDir, "1.0")
				.then(function () {
					assert(false, "A checkout on an invalid repo unexpectedly succeeded");
				}, function (error) {
					assert.ok(error);
					assert.match(error.message, /Not a git repository/);
				}).finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});

	it("can checkout a tag", function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			var head = path.resolve(tmpDir, ".git/HEAD");
			var ref = "bcc8a837055fe720579628d758b7034d6b520f2e";

			git.clone("test/fixtures/jquery.git", tmpDir)
				.then(function () {
					assert.equal("ref: refs/heads/master\n", fs.readFileSync(head, "utf8"));
					return git.checkout(tmpDir, "1.0");
				})
				.then(function () {
					assert.equal(ref + "\n", fs.readFileSync(head, "utf8"));
					done();
				}, done)
				.finally(function () {
					rimraf.sync(tmpDir);
				})
				.done();
		});
	});

	it("fails if the working directory is not clean", function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.clone("test/fixtures/jquery.git", tmpDir)
				.then(function () {
					fs.writeFileSync(path.resolve(tmpDir, "README.md"), "changed");
				})
				.then(function () {
					return git.checkout(tmpDir, "1.0");
				})
				.then(function () {
					assert(false, "A checkout with a dirty working path unexpectedly succeeded");
				}, function (error) {
					assert.ok(error);
				})
				.finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});

	it("...unless you use the 'force' option", function (done) {
		tmp.dir(function (error, tmpDir) {
			if (error) {
				throw error;
			}

			git.clone("test/fixtures/jquery.git", tmpDir)
				.then(function () {
					fs.writeFileSync(path.resolve(tmpDir, "README.md"), "changed");
				})
				.then(function () {
					return git.checkout(tmpDir, "1.0", {force: true});
				})
				.then(function (result) {
					assert.ok(result);
				})
				.finally(function () {
					rimraf.sync(tmpDir);
					done();
				})
				.done();
		});
	});
});
