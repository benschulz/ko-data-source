'use strict';

define(['../create-client-side-data-source'], function (createClientSideDataSource) {
    return function () {
        describe('clipped', function () {
            it('A clipped view should be disposable.', function () {
                var dataSource = createClientSideDataSource();

                var clippedView = dataSource.openView().clipped(1, 1);

                clippedView.dispose();
            });

            it('A clipped view can not be filtered.', function () {
                var dataSource = createClientSideDataSource();

                var clippedView = dataSource.openView().clipped(1, 1);

                expect(clippedView.filteredBy.bind(function () {return true; })).to.throw(Error);
            });

            it('A clipped view can not be ordered.', function () {
                var dataSource = createClientSideDataSource();

                var clippedView = dataSource.openView().clipped(1, 1);

                expect(clippedView.orderedBy.bind(function () {return 0; })).to.throw(Error);
            });

            it('A clipped view can not be ordered.', function () {
                var dataSource = createClientSideDataSource();

                var clippedView = dataSource.openView().clipped(1, 1);

                expect(clippedView.clipped.bind(2, 2)).to.throw(Error);
            });

            it('A clipped view should initially contain only entries with the clipping window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4]);

                var clippedView = dataSource.openView().orderedBy(function (a, b) { return a - b; }).clipped(1, 2);

                expect(clippedView.values()).to.eql([2, 3]);
            });

            it('The clipping view should be updated when an entry is inserted within the clipping window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 4, 5]);
                var clippedView = dataSource.openView().orderedBy(function (a, b) { return a - b; }).clipped(1, 3);

                dataSource.addEntries([3]);

                expect(clippedView.values()).to.eql([2, 3, 4]);
            });

            it('The clipping view should be updated when an entry is inserted before the clipping window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4, 5]);
                var clippedView = dataSource.openView().orderedBy(function (a, b) { return a - b; }).clipped(2, 3);

                dataSource.addEntries([0]);

                expect(clippedView.values()).to.eql([2, 3, 4]);
            });

            it('The clipping view should remain unchanged when an entry is inserted behind the clipping window.', function () {
                var dataSource = createClientSideDataSource([1, 2, 3, 4, 5]);
                var clippedView = dataSource.openView().orderedBy(function (a, b) { return a - b; }).clipped(1, 3);
                var initialValues = clippedView.values();

                dataSource.addEntries([6]);

                expect(clippedView.values()).to.eql(initialValues);
            });
        });
    };
});
