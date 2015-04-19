'use strict';

define(['../create-client-side-data-source.test'], function (createClientSideDataSource) {
    return function () {
        describe('offsetBy:', function () {
            it('An offset view should initially contain only entries after the offset.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4]);

                var offset = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(1));

                expect(offset.values()).to.eql([2, 3, 4]);
            });

            it('The offset view should be updated when an entry is inserted before the clipping window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4, 5]);
                var offset = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(2));

                dataSource.addEntries([0]);

                expect(offset.values()).to.eql([2, 3, 4, 5]);
            });

            it('The offset view should be updated when an entry is inserted after the offset.', function () {
                var dataSource = createClientSideDataSource([1, 2, 4, 5]);
                var offset = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(1));

                dataSource.addEntries([3]);

                expect(offset.values()).to.eql([2, 3, 4, 5]);
            });
        });
    };
});
