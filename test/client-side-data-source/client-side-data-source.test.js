'use strict';

define([
    './open-view/open-view.test',
    './size.test',
    './open-entry-view.test',
    './open-optional-entry-view.test',
    './stream-values.test'
], function () {
    var tests = Array.prototype.slice.call(arguments);

    describe('ClientSideDataSource:', function () {
        Array.prototype.slice.call(tests).forEach(function (test) {
            test();
        });
    });
});
