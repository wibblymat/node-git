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

var exec   = require("child_process").exec,
	Q      = require("q"),
	concat = [].concat.bind([]);

var shellEscape = function (arg) {
	return "'" + (arg + "").replace(/(["\s'$`\\])/g, "\\$1") + "'";
};

var notEmpty = function (item) {
	if (Array.isArray(item)) {
		return item.length > 0;
	}
	return !!item;
};

var git = function (parameters, options) {
	parameters = parameters || [];
	options = options || {};
	var command = "git " + concat.apply([], parameters)
		.filter(notEmpty)
		.map(shellEscape)
		.join(" ");
	return Q.nfcall(exec, command, options);
};

var error = function (message, Type) {
	Type = Type || Error;
	var deferred = Q.defer();
	deferred.reject(new Type(message));
	return deferred.promise;
};


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

		return git(["checkout", "-q", what, params], {cwd: repo});
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

		return git(["clean", "-q", "-f", params], {cwd: repo});
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

		return git(["clone", "-q", params, source, destination]);
	},
};
