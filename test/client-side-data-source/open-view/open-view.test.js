'use strict';

define(['../create-client-side-data-source.test', './filtered-by.test', './sorted-by.test', './offset-by.test', './limited-to.test'], function (createClientSideDataSource) {
    var tests = Array.prototype.slice.call(arguments, 1);

    return () => {
        describe('openView:', function () {
            Array.prototype.slice.call(tests).forEach(function (test) {
                test();
            });
        });
    };
});
