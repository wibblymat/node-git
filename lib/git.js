"use strict";

/*

	Stuff Bower needs:

	[*]	git clone {url} {path}
	[*]	git checkout {tag} -f
	[*]	git clean -f -d
	[ ]	git describe --always --tag
	[ ]	git tag
	[ ]	git log -n 1 --format=%H
	[ ]	git fetch --prune
	[ ]	git reset --hard [origin/HEAD | HEAD]

*/

var exec = require("child_process").exec;
var Q    = require("q");

var shellEscape = function (arg) {
	return "'" + (arg + "").replace(/(["\s'$`\\])/g, "\\$1") + "'";
};

var git = function (parameters, options) {
	parameters = parameters || [];
	options = options || {};
	return Q.nfcall(exec, "git " + parameters.map(shellEscape).join(" "), options);
};

var error = function (message, Type) {
	Type = Type || Error;
	var deferred = Q.defer();
	deferred.reject(new Type(message));
	return deferred.promise;
};

var concat = [].concat.bind([]);

module.exports = {
	checkout: function (repo, what, options) {
		if (!repo || !what) {
			return error("You must specify a repo and a branch or commit", TypeError);
		}

		var params = [];
		options = options || {};

		if (options.force) {
			params.push("-f");
		}

		return git(concat(["checkout", "-q", what], params), {cwd: repo});
	},

	clean: function (repo, options) {
		if (!repo) {
			return error("You must specify a repo to clean", TypeError);
		}

		var params = [];
		options = options || {};

		if (options.directories) {
			params.push("-d");
		}

		return git(concat(["clean", "-q", "-f"], params), {cwd: repo});
	},

	clone: function (source, destination, options) {
		if (!source || !destination) {
			return error("You must specify a source and a destination for clone", TypeError);
		}

		var params = [];
		options = options || {};

		if (options.depth) {
			params.push("--depth");
			params.push(parseInt(options.depth, 10));
		}

		return git(concat(["clone", "-q"], params, [source, destination]));
	}
};
