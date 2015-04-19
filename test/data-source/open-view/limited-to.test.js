'use strict';

define([], function () {
    return factory => {
        describe('limitedTo:', function () {
            it('A limited view should be disposable.', function () {
                var dataSource = factory();

                var limited = dataSource.openView(q => q.limitedTo(1));

                limited.dispose();
            });
        });
    };
});
