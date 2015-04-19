'use strict';

define([
    '../data-source/data-source.test',
    './create-server-side-data-source.test'
], function (dataSourceTests, createServerSideDataSource) {
    var tests = Array.prototype.slice.call(arguments, 2);

    dataSourceTests('ServerSideDataSource', createServerSideDataSource);

    describe('ServerSideDataSource:', function () {
        Array.prototype.slice.call(tests).forEach(function (test) {
            test();
        });
    });
});
