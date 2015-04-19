'use strict';

define(['../create-client-side-data-source.test'], function (createClientSideDataSource) {
    return function () {
        describe('limitedTo:', function () {
            it('A limited view should initially contain only `limit` entries.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4]);

                var limited = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(1).limitedTo(2));

                expect(limited.values()).to.eql([2, 3]);
            });

            it('The limited view should be updated when an entry is inserted within its window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 4, 5]);
                var limited = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(1).limitedTo(3));

                dataSource.addEntries([3]);

                expect(limited.values()).to.eql([2, 3, 4]);
            });

            it('The limited view should be updated when an entry is inserted before its window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4, 5]);
                var limited = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(2).limitedTo(3));

                dataSource.addEntries([0]);

                expect(limited.values()).to.eql([2, 3, 4]);
            });

            it('The limited view should remain unchanged when an entry is inserted behind its window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4, 5]);
                var limited = dataSource.openView(q => q.sortedBy((a, b)=> a - b).offsetBy(1).limitedTo(3));
                var initialValues = limited.values();

                dataSource.addEntries([6]);

                expect(limited.values()).to.eql(initialValues);
            });
        });
    };
});
