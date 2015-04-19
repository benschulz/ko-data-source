'use strict';

define([], function () {
    return factory => {
        describe('filteredBy:', function () {
            it('A filtered view should be disposable.', function () {
                var dataSource = factory();

                var filteredView = dataSource.openView(q => q.filteredBy(() => true));

                filteredView.dispose();
            });
        });
    };
});
