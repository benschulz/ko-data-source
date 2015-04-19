'use strict';

define(['ko-data-source'], function (koDataSource) {
    return function (entriesOrOptions, options) {
        var entries = Array.isArray(entriesOrOptions) ? entriesOrOptions : [];
        options = options || entriesOrOptions || {};

        var idSelector = e =>  e.id || '' + e;
        var querier = {
            issue: query => {
                return new Promise(function (resolve) {
                    var matching = entries.filter(query.predicate);
                    matching.sort(query.comparator);
                    var clipped = matching.slice(query.offset, query.offset + query.limit);

                    resolve({
                        unfilteredSize: entries.length,
                        filteredSize: matching.length,
                        values: koDataSource.streams.streamArray(clipped)
                    });
                });
            }
        };
        var observableStateTransitioner = new koDataSource.DefaultObservableStateTransitioner(options);
        var observableEntries = new koDataSource.ObservableEntries(idSelector, observableStateTransitioner);
        return new koDataSource.ServerSideDataSource(idSelector, querier, observableEntries);
    };
});
