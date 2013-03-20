"use strict";

module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			files: ["Gruntfile.js", "lib/**/*.js", "test/*.js"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		watch: {
			files: ["<%= jshint.files %>"],
			tasks: ["jshint", "simplemocha"]
		},

		simplemocha: {
			options: {
				globals: ["should"],
				timeout: 3000,
				ignoreLeaks: false,
				ui: "bdd",
				reporter: "spec"
			},
			all: { src: "test/**/*.js" }
		}

	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");

	grunt.registerTask("test", ["jshint", "simplemocha"]);
	grunt.registerTask("default", ["jshint"]);
	grunt.loadNpmTasks("grunt-simple-mocha");
};
