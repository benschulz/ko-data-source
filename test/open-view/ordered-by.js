'use strict';

define(['../create-client-side-data-source'], function (createClientSideDataSource) {
    return function () {
        describe('ordered', function () {
            it('An ordered view should be disposable.', function () {
                var dataSource = createClientSideDataSource();

                var orderedView = dataSource.openView().orderedBy(function () { return 0; });

                orderedView.dispose();
            });

            it('An ordered view can not be filtered.', function () {
                var dataSource = createClientSideDataSource();

                var orderedView = dataSource.openView().orderedBy(function () { return 0; });

                expect(orderedView.filteredBy.bind(function () {return true; })).to.throw(Error);
            });

            it('An ordered view can not be ordered.', function () {
                var dataSource = createClientSideDataSource();

                var orderedView = dataSource.openView().orderedBy(function () { return 0; });

                expect(orderedView.orderedBy.bind(function () {return 0; })).to.throw(Error);
            });

            it('An elements of an ordered view should initially be ordered as defined.', function () {
                var dataSource = createClientSideDataSource([3, 7, 9, 10, 4, 1, 5, 2, 6, 8]);

                var ordered = dataSource.openView().orderedBy(function (a, b) { return a - b; });

                expect(ordered.values()).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            });

            it('When an item is added, it should be added at the appropriate position.', function () {
                var dataSource = createClientSideDataSource([7, 6, 5, 3, 2, 1]);
                var ordered = dataSource.openView().orderedBy(function (a, b) { return a - b; });

                dataSource.addEntries([4]);

                expect(ordered.values()).to.eql([1, 2, 3, 4, 5, 6, 7]);
            });
        });
    };
});
