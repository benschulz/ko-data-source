'use strict';

define([
    './client-side-data-source/client-side-data-source',
    './default-observable-state-transitioner',
    './observable-entries',
    './server-side-data-source/server-side-data-source',
    './streams/streams'
], function (
    ClientSideDataSource,
    DefaultObservableStateTransitioner,
    ObservableEntries,
    ServerSideDataSource,
    streams
) {
    return {
        'ClientSideDataSource': ClientSideDataSource,
        'DefaultObservableStateTransitioner': DefaultObservableStateTransitioner,
        'ObservableEntries': ObservableEntries,
        'ServerSideDataSource': ServerSideDataSource,

        'streams': streams
    };
});
