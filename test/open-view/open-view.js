'use strict';

define(['../create-client-side-data-source', './filtered-by', './ordered-by', './clipped'], function (createClientSideDataSource) {
    var tests = Array.prototype.slice.call(arguments, 1);

    describe('openView', function () {
        it('The root view should be disposable.', function () {
            var dataSource = createClientSideDataSource();

            var rootView = dataSource.openView();

            rootView.dispose();
        });

        Array.prototype.slice.call(tests).forEach(function (test) {
            test();
        });
    });
});
