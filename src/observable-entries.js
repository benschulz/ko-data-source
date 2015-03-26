'use strict';
define(['knockout'], function (ko) {
    /** @constructor */
    function ObservableEntry(observable) {
        this.observable = observable;
        this.optionalObservable = ko.observable(observable);
        this.refcount = 1;
    }

    // TODO reduce interface to minimum (addReference, addOptionalReference, releaseReference, updateEntries, dispose, ...?)
    return function ObservableEntries(idSelector, observableStateTransitioner) {
        observableStateTransitioner = observableStateTransitioner || {
            constructor: function (entry) {
                var observable = {};
                Object.keys(entry).forEach(function (k) {
                    observable[k] = ko.observable(entry[k]);
                });
                return observable;
            },
            updater: function (observable, updatedEntry) {
                Object.keys(updatedEntry).forEach(function (k) {
                    observable[k](updatedEntry[k]);
                });
                return observable;
            },
            destructor: function () {}
        };

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
            var entry = new ObservableEntry(observableStateTransitioner.constructor(value));
            hashtable[id] = entry;
            return entry;
        };

        this.releaseReference = function (value) {
            var id = idSelector(value);
            var entry = lookupEntry(id);
            if (--entry.refcount === 0) {
                observableStateTransitioner.destructor(entry.observable);
                delete hashtable[id];
            }
        };

        this.forcefullyReleaseRemainingReferencesById = function (id) {
            var entry = lookupEntry(id);
            entry.optionalObservable(null);
            observableStateTransitioner.destructor(entry.observable);
            delete hashtable[id];
        };

        this.lookup = value => lookupEntry(idSelector(value)).observable;

        this.withById = (id, action) => action(lookupEntry(id).observable);

        this.with = (value, action) => this.withById(idSelector(value), action);

        this.withPresentById = function (id, action) {
            var entry = tryLookupEntry(id);
            if (entry)
                action(entry.observable);
        };

        this.withPresent = (value, action) => this.withPresentById(idSelector(value), action);

        this.updateEntries = updatedEntries => {
            updatedEntries.forEach(updatedEntry => {
                this.withPresent(updatedEntry, observable => {
                    observableStateTransitioner.updater(observable, updatedEntry);
                });
            });
        };

        this.dispose = () => {
            Object.keys(hashtable).forEach(this.forcefullyReleaseRemainingReferencesById);
        };

        var tryLookupEntry = function (id) {
            if (typeof id !== 'string')
                throw newInvalidIdTypeError(id);
            if (!Object.prototype.hasOwnProperty.call(hashtable, id))
                return null;
            return hashtable[id];
        };

        var lookupEntry = function (id) {
            var entry = tryLookupEntry(id);
            if (!entry)
                throw new Error('Es existierte keine Referenz zum Objekt mit Id \'' + id + '\' oder es wurden bereits alle freigegeben.');
            return entry;
        };
    };
});
