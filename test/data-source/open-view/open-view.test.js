'use strict';

define(['./filtered-by.test', './sorted-by.test', './offset-by.test', './limited-to.test'], function () {
    var tests = Array.prototype.slice.call(arguments, 1);

    return factory => {
        describe('openView:', function () {
            it('The root view should be disposable.', function () {
                var dataSource = factory();

                var rootView = dataSource.openView();

                rootView.dispose();
            });

            Array.prototype.slice.call(tests).forEach(function (test) {
                test(factory);
            });
        });
    };
});
