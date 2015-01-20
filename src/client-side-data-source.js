'use strict';

define(['knockout', 'onefold-js', 'indexed-list', './views/views', './delta'], function (ko, js, IndexedList, views, Delta) {
    return function ClientSideDataSource(idSelector, observableEntries) {
        var values = new IndexedList(idSelector);
        var deltas = ko.observable(new Delta());

        this.openEntryView = entryId => {
            var optionalEntryView = this.openOptionalEntryView(entryId);
            var subscription = null;

            return {
                value: optionalEntryView.value.bind(optionalEntryView),
                observable: function () {
                    if (!subscription) {
                        subscription = optionalEntryView.optionalObservable().subscribe(function () {
                            throw new Error('Es ist noch eine nicht-optionale View zum entfernten Eintrag offen.');
                        });
                    }

                    return optionalEntryView.observable();
                },
                dispose: function () {
                    if (subscription)
                        subscription.dispose();
                    optionalEntryView.dispose();
                }
            };
        };

        this.openOptionalEntryView = entryId => {
            var disposed = false;
            var lastKnownValue = null;
            var observable = null;
            var optionalObservable = null;
            var subscription = null;

            var assertNotDisposed = function () {
                if (disposed)
                    throw new Error('Ungültiger Zustand: Diese Entry-View wurde bereits freigegeben.');
            };

            var optionalEntryView = {
                value: function () {
                    assertNotDisposed();
                    lastKnownValue = values.getById(entryId);
                    return lastKnownValue;
                },
                observable: function () {
                    assertNotDisposed();
                    if (!observable)
                        observable = observableEntries.addReference(optionalEntryView.value());
                    return observable;
                },
                optionalObservable: function () {
                    assertNotDisposed();
                    if (optionalObservable)
                        return optionalObservable;

                    var sharedObservable = observableEntries.addOptionalReference(optionalEntryView.value());

                    observable = sharedObservable();
                    optionalObservable = ko.observable({
                        present: true,
                        value: optionalEntryView.observable()
                    });

                    subscription = sharedObservable.subscribe(function () {
                        optionalObservable({
                            present: false,
                            value: optionalEntryView.observable()
                        });
                    });

                    return optionalObservable;
                },
                dispose: function () {
                    assertNotDisposed();
                    disposed = true;

                    if (subscription) {
                        subscription.dispose();
                        subscription = null;
                        observableEntries.releaseReference(lastKnownValue);
                        observable = null;
                    }
                }
            };
            return optionalEntryView;
        };

        this.openView = () => new views.RootView(idSelector, observableEntries, values, deltas);
        this['openView'] = this.openView;

        this['addEntries'] = function (newEntries) {
            values.addAll(newEntries);
            new Delta(newEntries).propagateTo(deltas);
        };

        this['updateEntries'] = function (updatedEntries) {
            values.updateAll(updatedEntries);
            new Delta([], updatedEntries).propagateTo(deltas);
            observableEntries.updateEntries(updatedEntries);
        };

        this['addOrUpdateEntries'] = function (entries) {
            var added = [];
            var updated = [];
            entries.forEach(function (entry) {
                (values.contains(entry) ? updated : added).push();
            });
            new Delta(added, updated).propagateTo(deltas);
        };

        this['removeEntries'] = function (entries) {
            values.removeAll(entries);
            new Delta([], [], entries).propagateTo(deltas);
        };

        this['replaceEntries'] = function (newEntries) {
            var removedEntries = values.toArray();
            values.clear();
            values.addAll(newEntries);
            new Delta(newEntries, [], removedEntries).propagateTo(deltas);
            // TODO update only those that were already there before the delta was propagated
            observableEntries.updateEntries(newEntries);
        };

        this.dispose = function () { };
    };
});
