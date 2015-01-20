'use strict';

define(['ko-data-source'], function (koDataSource) {
    return function (initialEntries) {
        var idSelector = function (x) { return '' + x; };
        var observableEntries = new koDataSource.ObservableEntries(idSelector);
        var dataSource = new koDataSource.ClientSideDataSource(idSelector, observableEntries);

        if (initialEntries)
            dataSource.addEntries(initialEntries);

        return dataSource;
    };
});
