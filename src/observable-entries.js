'use strict';

define(['knockout', 'onefold-js', './default-observable-state-transitioner'], function (ko, js, DefaultObservableStateTransitioner) {
    /** @constructor */
    function ObservableEntry(observable) {
        this.observable = observable;
        this.optionalObservable = ko.observable(observable);
        this.refcount = 1;
    }

    // TODO clean up extract prototype
    return function ObservableEntries(idSelector, observableStateTransitioner) {
        observableStateTransitioner = observableStateTransitioner || new DefaultObservableStateTransitioner();

        var hashtable = {};

        var newInvalidIdTypeError = function (id) {
            throw new Error('Illegal argument: Ids must be strings (\'' + id + '\' is of type \'' + typeof id + '\').');
        };

        this.addReference = value => addAnyReference(value).observable;

        this.addOptionalReference = value => addAnyReference(value).optionalObservable;

        var addAnyReference = function (value) {
            var id = idSelector(value);
            if (typeof id !== 'string')
                throw newInvalidIdTypeError(id);

            return Object.prototype.hasOwnProperty.call(hashtable, id) ? addReferenceToExistingEntry(id) : addEntry(id, value);
        };

        var addReferenceToExistingEntry = function (id) {
            var entry = hashtable[id];
            ++entry.refcount;
            return entry;
        };

        var addEntry = function (id, value) {
            var entry = new ObservableEntry(observableStateTransitioner['constructor'](value));
            hashtable[id] = entry;
            return entry;
        };

        this.releaseReference = function (value) {
            var id = idSelector(value);
            var entry = lookupEntry(id);
            if (--entry.refcount === 0) {
                destroy(entry);
                delete hashtable[id];
            }
        };

        this.lookup = value => lookupEntry(idSelector(value)).observable;

        this.reconstructEntries = addedEntries => {
            addedEntries.forEach(addedEntry => {
                var id = idSelector(addedEntry);

                if (js.objects.hasOwn(hashtable, id)) {
                    var entry = hashtable[id];

                    if (!entry.observable) {
                        entry.observable = observableStateTransitioner['constructor'](addedEntry);
                        entry.optionalObservable(entry.observable);
                    }
                }
            });
        };

        this.updateEntries = updatedEntries => {
            updatedEntries.forEach(updatedEntry => {
                var id = idSelector(updatedEntry);

                if (js.objects.hasOwn(hashtable, id)) {
                    var entry = hashtable[id];
                    observableStateTransitioner['updater'](entry.observable, updatedEntry);
                }
            });
        };

        this.reconstructUpdateOrDestroyAll = updatedValueSupplier => {
            js.objects.forEachProperty(hashtable, (id, entry) => {
                var updatedValue = updatedValueSupplier(id);

                if (updatedValue) {
                    if (entry.observable) {
                        observableStateTransitioner['updater'](entry.observable, updatedValue);
                    } else {
                        entry.observable = observableStateTransitioner['constructor'](updatedValue);
                        entry.optionalObservable(entry.observable);
                    }
                } else {
                    destroy(entry);
                }
            });
        };

        this.destroyAll = idPredicate => {
            js.objects.forEachProperty(hashtable, (id, entry) => {
                if (idPredicate(id))
                    destroy(entry);
            });
        };

        function destroy(entry) {
            var observable = entry.observable;
            entry.optionalObservable(null);
            entry.observable = null;
            observableStateTransitioner['destructor'](observable);
        }

        this.dispose = () => { this.destroyAll(() => true); };

        var lookupEntry = function (id) {
            if (typeof id !== 'string')
                throw newInvalidIdTypeError(id);
            if (js.objects.hasOwn(hashtable, id))
                return hashtable[id];
            else
                throw new Error('No entry for id `' + id + '`.');
        };
    };
});
