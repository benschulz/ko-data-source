'use strict';

define(['../create-client-side-data-source.test', './filtered-by.test', './sorted-by.test', './offset-by.test', './limited-to.test'], function (createClientSideDataSource) {
    var tests = Array.prototype.slice.call(arguments, 1);

    return () => {
        describe('openView:', function () {
            it('The root view should be disposable.', function () {
                var dataSource = createClientSideDataSource();

                var rootView = dataSource.openView();

                rootView.dispose();
            });

            Array.prototype.slice.call(tests).forEach(function (test) {
                test();
            });
        });
    };
});
