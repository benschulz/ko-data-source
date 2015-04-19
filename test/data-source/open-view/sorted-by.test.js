'use strict';

define([], function () {
    return factory => {
        describe('sortedBy:', function () {
            it('A sorted view should be disposable.', function () {
                var dataSource = factory();

                var sorted = dataSource.openView(q =>q.sortedBy(() => 0));

                sorted.dispose();
            });
        });
    };
});
