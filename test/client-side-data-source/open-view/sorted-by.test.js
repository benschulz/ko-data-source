'use strict';

define(['../create-client-side-data-source.test'], function (createClientSideDataSource) {
    return function () {
        describe('sortedBy:', function () {
            it('An elements of A sorted view should initially be sorted as defined.', function () {
                var dataSource = createClientSideDataSource([3, 7, 9, 10, 4, 1, 5, 2, 6, 8]);

                var sorted = dataSource.openView(q => q.sortedBy((a, b) => a - b));

                expect(sorted.values()).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            });

            it('When an item is added, it should be added at the appropriate position.', function () {
                var dataSource = createClientSideDataSource([7, 6, 5, 3, 2, 1]);
                var sorted = dataSource.openView(q => q.sortedBy((a, b) => a - b));

                dataSource.addEntries([4]);

                expect(sorted.values()).to.eql([1, 2, 3, 4, 5, 6, 7]);
            });
        });
    };
});
