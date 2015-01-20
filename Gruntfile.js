'use strict';

module.exports = function (grunt) {
    require('grunt-commons')(grunt, {
        name: 'ko-data-source',
        main: 'ko-data-source',
        internalMain: 'ko-data-source',

        shims: {
            knockout: 'window.ko'
        }
    }).initialize({});
};
