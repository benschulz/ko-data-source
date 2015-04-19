'use strict';

define([], function () {
    return factory => {
        describe('offsetBy:', function () {
            it('An offset view should be disposable.', function () {
                var dataSource = factory();

                var offset = dataSource.openView(q => q.offsetBy(1));

                offset.dispose();
            });
        });
    };
});
