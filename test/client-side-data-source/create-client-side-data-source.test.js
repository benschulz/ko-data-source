'use strict';

define(['ko-data-source'], function (koDataSource) {
    return function (initialEntriesOrOptions, options) {
        options = options || initialEntriesOrOptions || {};

        var idSelector = e =>  e.id || '' + e;
        var observableStateTransitioner = new koDataSource.DefaultObservableStateTransitioner(options);
        var observableEntries = new koDataSource.ObservableEntries(idSelector, observableStateTransitioner);
        var dataSource = new koDataSource.ClientSideDataSource(idSelector, observableEntries);

        if (Array.isArray(initialEntriesOrOptions))
            dataSource.addEntries(initialEntriesOrOptions);

        return dataSource;
    };
});
