'use strict';

define(['./client-side-data-source/client-side-data-source', './default-observable-state-transitioner', './observable-entries'],
    function (ClientSideDataSource, DefaultObservableStateTransitioner, ObservableEntries) {
        return {
            // TODO ServerSideDataSource: extend (and partially reduce?) DataSource interface to make room
            'ClientSideDataSource': ClientSideDataSource,
            'DefaultObservableStateTransitioner': DefaultObservableStateTransitioner,
            'ObservableEntries': ObservableEntries
        };
    });