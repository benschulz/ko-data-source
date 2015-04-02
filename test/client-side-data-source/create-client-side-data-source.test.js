'use strict';

define(['ko-data-source'], function (koDataSource) {
    return function (initialEntries) {
        var dataSource = new koDataSource.ClientSideDataSource(e =>  e.id || '' + e);

        if (initialEntries)
            dataSource.addEntries(initialEntries);

        return dataSource;
    };
});
