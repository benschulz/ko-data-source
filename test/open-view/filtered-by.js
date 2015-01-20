'use strict';

define(['../create-client-side-data-source'], function (createClientSideDataSource) {
    return function () {
        describe('filtered', function () {
            it('A filtered view should be disposable.', function () {
                var dataSource = createClientSideDataSource();

                var filteredView = dataSource.openView().filteredBy(function () { return true; });

                filteredView.dispose();
            });

            it('A filtered view should initially only contain elements matching the predicate.', function () {
                var dataSource = createClientSideDataSource([3, 7, 9, 10, 4, 1, 5, 2, 6, 8]);
                var view = dataSource.openView();

                var filtered = view.filteredBy(function (e) { return e % 2 === 0; });

                expect(filtered.values()).to.contain.exactly([10, 4, 2, 6, 8]);
            });

            it('When an item which satisfies the predicate is added, it should be added to the filtered view.', function () {
                var dataSource = createClientSideDataSource();
                var view = dataSource.openView();
                var filtered = view.filteredBy(function (e) { return e % 2 === 0; });

                dataSource.addEntries([100]);

                expect(filtered.values()).to.contain.exactly([100]);
            });

            it('When an item which does not satisfy the predicate is added, it should not be added to the filtered view.', function () {
                var dataSource = createClientSideDataSource();
                var view = dataSource.openView();
                var filtered = view.filteredBy(function (e) { return e % 2 === 0; });

                dataSource.addEntries([99]);

                expect(filtered.values()).to.contain.exactly([]);
            });

            it('An entry previously not satisfying the predicate should be added to the filtered view when it is updated to satisfy the predicate.', function () {
                var dataSource = createClientSideDataSource([{id: 0, value: 99}]);
                var filtered = dataSource.openView().filteredBy(function (e) { return e.value % 2 === 0; });

                var updatedEntry = {id: 0, value: 100};
                dataSource.updateEntries([updatedEntry]);

                expect(filtered.values()).to.contain.exactly([updatedEntry]);
            });

            it('An entry previously satisfying the predicate should be removed from the filtered view when it is updated to not satisfy the predicate.', function () {
                var dataSource = createClientSideDataSource([{id: 0, value: 100}]);
                var filtered = dataSource.openView().filteredBy(function (e) { return e.value % 2 === 0; });

                dataSource.updateEntries([{id: 0, value: 99}]);

                expect(filtered.values()).to.contain.exactly([]);
            });

            it('An entry satisfying the predicate should be updated in the filtered view when it is updated.', function () {
                var dataSource = createClientSideDataSource([{id: 0, value: -0}]);
                var filtered = dataSource.openView().filteredBy(function (e) { return e.value % 2 === 0; });

                var updatedEntry = {id: 0, value: 0};
                dataSource.updateEntries([updatedEntry]);

                expect(filtered.values()).to.contain.exactly([updatedEntry]);
            });

            it('The filtered view should be unaffected when an entry not satisfying the predicate is updated.', function () {
                var dataSource = createClientSideDataSource([{id: 0, value: -1}]);
                var filtered = dataSource.openView().filteredBy(function (e) { return e.value % 2 === 0; });

                dataSource.updateEntries([{id: 0, value: 1}]);

                expect(filtered.values()).to.contain.exactly([]);
            });
        });
    };
});
