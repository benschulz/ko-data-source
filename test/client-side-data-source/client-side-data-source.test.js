'use strict';

define([
    '../data-source/data-source.test',
    './create-client-side-data-source.test',
    './open-entry-view.test',
    './open-optional-entry-view.test',
    './open-view/open-view.test',
    './size.test',
], function (dataSourceTests, createClientSideDataSource) {
    var tests = Array.prototype.slice.call(arguments, 2);

    dataSourceTests('ClientSideDataSource', createClientSideDataSource);

    describe('ClientSideDataSource:', function () {
        Array.prototype.slice.call(tests).forEach(function (test) {
            test();
        });
    });
});
