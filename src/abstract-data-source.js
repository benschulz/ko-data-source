'use strict';

define(['knockout', 'onefold-js', './streams/mapped-stream'], function (ko, js, MappedResource) {
    /**
     * @constructor
     * @template I, V, O
     * @extends {DataSource<I, V, O>}
     *
     * @param {!ObservableEntries<I, V, O>} observableEntries
     * @param {!function(I):V} getValueById
     */
    function AbstractDataSource(observableEntries, getValueById) {
        this.__getValueById = getValueById;
        this.__observableEntries = observableEntries;
    }

    AbstractDataSource.prototype = {
        openEntryView: function (entryId) {
            return new DefaultEntryView(this.openOptionalEntryView(entryId));
        },

        openOptionalEntryView: function (entryId) {
            return new DefaultOptionalEntryView(this.__observableEntries, this.__getValueById, entryId);
        },

        streamObservables: function (queryConfiguration) {
            return this.streamValues(queryConfiguration).then(values => {
                return new MappedResource(values,
                    this.__observableEntries.addReference.bind(this.__observableEntries),
                    this.__observableEntries.releaseReference.bind(this.__observableEntries)                );
            });
        },

        openView: function () { throw new Error('`' + this.constructor + '` does not implement `openView`.'); },
        streamValues: function () { throw new Error('`' + this.constructor + '` does not implement `streamValues`.'); },
        dispose: function () { throw new Error('`' + this.constructor + '` does not implement `dispose`.'); }
    };

    var proto = AbstractDataSource.prototype;
    js.objects.extend(proto, {
        'openEntryView': proto.openEntryView,
        'openOptionalEntryView': proto.openOptionalEntryView,
        'streamObservables': proto.streamObservables
    });

    /**
     * @constructor
     * @template V, O
     * @extends {EntryView<V, O>}
     *
     * @param {OptionalEntryView<V, O>} optionalEntryView
     */
    function DefaultEntryView(optionalEntryView) {
        this.__optionalEntryView = optionalEntryView;
        this.__subscription = null;
    }

    DefaultEntryView.prototype = {
        get value() { return this.__optionalEntryView.value; },
        get observable() {
            if (!this.__subscription) {
                this.__subscription = this.__optionalEntryView.optionalObservable.subscribe(function () {
                    throw new Error('Illegal state: A non-optional view for this entry is still open.');
                });
            }

            return this.__optionalEntryView.observable;
        },
        dispose: function () {
            if (this.__subscription)
                this.__subscription.dispose();
            this.__optionalEntryView.dispose();
        }
    };

    /**
     * @constructor
     * @template I, V, O
     * @extends {OptionalEntryView<V, O>}
     *
     * @param {ObservableEntries<I, V, O>} observableEntries
     * @param {function(V):I} getValueById
     * @param {I} entryId
     */
    function DefaultOptionalEntryView(observableEntries, getValueById, entryId) {
        this.__observableEntries = observableEntries;
        this.__getValueById = getValueById;
        this.__entryId = entryId;

        this.__disposed = false;
        this.__lastKnownValue = null;
        this.__observable = null;
        this.__optionalObservable = null;
        this.__subscription = null;
    }

    DefaultOptionalEntryView.prototype = {
        __assertNotDisposed: function () {
            if (this.__disposed)
                throw new Error('Illegal state: Entry view was already disposed.');
        },
        get value() {
            this.__assertNotDisposed();
            return (this.__lastKnownValue = this.__getValueById(this.__entryId));
        },
        get observable() {
            this.__assertNotDisposed();
            return (this.__observable || this.optionalObservable) && this.__observable;
        },
        get optionalObservable() {
            this.__assertNotDisposed();
            if (this.__optionalObservable)
                return this.__optionalObservable;

            var sharedObservable = this.__observableEntries.addOptionalReference(this.value());

            this.__observable = sharedObservable();
            this.__optionalObservable = ko.observable({
                present: true,
                observable: this.observable()
            });

            this.__subscription = sharedObservable.subscribe(() => {
                this.__optionalObservable({
                    present: false,
                    observable: this.observable()
                });
            });

            return this.__optionalObservable;
        },
        dispose: function () {
            this.__assertNotDisposed();
            this.__disposed = true;

            if (this.__subscription) {
                this.__subscription.dispose();
                this.__observableEntries.releaseReference(this.__lastKnownValue);
                this.__lastKnownValue = this.__observable = this.__optionalObservable = this.__subscription = null;
            }
        }
    };

    return AbstractDataSource;
});
