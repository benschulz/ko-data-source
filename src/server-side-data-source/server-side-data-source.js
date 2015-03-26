//'use strict';
//
//define(['knockout', 'onefold-js', 'onefold-lists'], function (ko, js, lists) {
//
//    // TODO jsdoc
//    return function ServerSideDataSource(idSelector, observableEntries, query) {
//        var values = {};
//
//        this.openEntryView = entryId => {
//            var optionalEntryView = this.openOptionalEntryView(entryId);
//            var subscription = null;
//
//            return {
//                value: optionalEntryView.value.bind(optionalEntryView),
//                observable: function () {
//                    if (!subscription) {
//                        subscription = optionalEntryView.optionalObservable().subscribe(function () {
//                            throw new Error('Illegal state: A non-optional view for this entry is still open.');
//                        });
//                    }
//
//                    return optionalEntryView.observable();
//                },
//                dispose: function () {
//                    if (subscription)
//                        subscription.dispose();
//                    optionalEntryView.dispose();
//                }
//            };
//        };
//
//        this.openOptionalEntryView = entryId => {
//            var disposed = false;
//            var lastKnownValue = null;
//            var observable = null;
//            var optionalObservable = null;
//            var subscription = null;
//
//            var assertNotDisposed = function () {
//                if (disposed)
//                    throw new Error('Illegal state: Entry view was already disposed.');
//            };
//
//            return {
//                value: function () {
//                    assertNotDisposed();
//                    if (!js.objects.hasOwn(values, entryId))
//                        throw new Error('No entry with id `' + entryId + '` present.');
//                    lastKnownValue = values[entryId];
//                    return lastKnownValue;
//                },
//                observable: function () {
//                    assertNotDisposed();
//                    if (!observable)
//                        this.optionalObservable();
//                    return observable;
//                },
//                optionalObservable: function () {
//                    assertNotDisposed();
//                    if (optionalObservable)
//                        return optionalObservable;
//
//                    var sharedObservable = observableEntries.addOptionalReference(this.value());
//
//                    observable = sharedObservable();
//                    optionalObservable = ko.observable({
//                        present: true,
//                        observable: this.observable()
//                    });
//
//                    subscription = sharedObservable.subscribe(() => {
//                        optionalObservable({
//                            present: false,
//                            observable: this.observable()
//                        });
//                    });
//
//                    return optionalObservable;
//                },
//                dispose: function () {
//                    assertNotDisposed();
//                    disposed = true;
//
//                    if (subscription) {
//                        subscription.dispose();
//                        observableEntries.releaseReference(lastKnownValue);
//                        lastKnownValue = observable = optionalObservable = subscription = null;
//                    }
//                }
//            };
//        };
//
//        function doQuery(filter, comparator, offset, amount, handler) {
//            query(filter, comparator, offset, amount)
//                .then(vs => {
//                    vs = vs.slice();
//
//                    var refs = vs.map(v => {
//                        var id = idSelector(v);
//
//                        var ref = js.objects.hasOwn(values, id)
//                            ? values[id]
//                            : (values[id] = {count: 1, value: v});
//
//                        ++ref.count;
//                    });
//
//                    handler(lists.newArrayList(vs), () => {
//                        refs.forEach(ref => {
//                            if (--ref.count === 0)
//                                delete values[idSelector(ref.value)];
//                        });
//                    });
//                });
//        }
//
//
//        this.openView = () => new QueryView();
//
//        function QueryView(filter, comparator, offset, amount) {
//            var values = ko.observable(lists.newArrayList());
//            var observables = false;
//            var disposed = false;
//
//            var oldValueDisposer = () => {};
//            var doDispose = () => {
//                if (observables) {
//                    values().forEach(observableEntries.releaseReference);
//                    observables = false;
//                }
//                oldValueDisposer();
//            };
//
//            var queryComputer = ko.pureComputed(() => {
//                if (disposed && values().length) {
//                    doDispose();
//                    values(lists.newArrayList());
//                } else if (!disposed)
//                    doQuery(
//                        ko.unwrap(filter) || (() => true),
//                        ko.unwrap(comparator) || (() => 0),
//                        ko.unwrap(offset) || 0,
//                        ko.unwrap(amount) || Number.POSITIVE_INFINITY,
//
//                        (values, disposer) => {
//                            values(values);
//                            doDispose();
//                            oldValueDisposer = disposer;
//                        });
//            });
//
//            var valuesComputer = ko.pureComputed(()=> {
//                queryComputer();
//                return values();
//            });
//
//            var observablesComputer = ko.pureComputed(()=> {
//                var vals = valuesComputer();
//                observables = vals.length > 0;
//                return vals.map(observableEntries.addReference);
//            });
//
//            var internal = {
//                get values() { return valuesComputer; },
//                get observables() { return observablesComputer; }
//            };
//
//            js.objects.extend(internal, {
//                get 'values'() { return this.values; },
//                get 'observables'() { return this.observables; },
//
//                'filteredBy': function (f) {
//                    if (offset !== undefined || amount !== undefined)
//                        throw new Error('Filtering a clipped view is not supported.');
//                    if (comparator !== undefined)
//                        throw new Error('Filtering an ordered view is not supported.');
//
//                    return new QueryView(filter ? filter.and(f) : f: )
//                },
//                "sortedBy": proto.sortedBy,
//                'clipped': proto.clipped
//            });
//        }
//
//        this['openView'] = this.openView;
//
//        this['addEntries'] = function (newEntries) {
//            values.addAll(newEntries);
//            new Delta(newEntries).propagateTo(deltas);
//        };
//
//        this['updateEntries'] = function (updatedEntries) {
//            values.updateAll(updatedEntries);
//            new Delta([], updatedEntries).propagateTo(deltas);
//            observableEntries.updateEntries(updatedEntries);
//        };
//
//        this['addOrUpdateEntries'] = function (entries) {
//            var added = [];
//            var updated = [];
//            entries.forEach(function (entry) {
//                (values.contains(entry) ? updated : added).push();
//            });
//            new Delta(added, updated).propagateTo(deltas);
//        };
//
//        this['removeEntries'] = function (entries) {
//            values.removeAll(entries);
//            new Delta([], [], entries).propagateTo(deltas);
//        };
//
//        this['replaceEntries'] = function (newEntries) {
//            var removedEntries = values.toArray();
//            values.clear();
//            values.addAll(newEntries);
//            new Delta(newEntries, [], removedEntries).propagateTo(deltas);
//            // TODO update only those that were already there before the delta was propagated
//            observableEntries.updateEntries(newEntries);
//        };
//
//        this.dispose = function () { };
//    };
//});
