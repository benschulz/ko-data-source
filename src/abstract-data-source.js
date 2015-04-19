'use strict';

define(['knockout', 'onefold-js', './streams/mapped-stream'], function (ko, js, MappedResource) {
    /**
     * @constructor
     * @template I, V, O
     * @extends {de.benshu.ko.dataSource.DataSource<I, V, O>}
     *
     * @param {!de.benshu.ko.dataSource.ObservableEntries<I, V, O>} observableEntries
     * @param {!function(I):V} getValueById
     */
    function AbstractDataSource(observableEntries, getValueById) {
        this.__observableEntries = observableEntries;
        this.__getValueById = getValueById;
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
                    this.__observableEntries.releaseReference.bind(this.__observableEntries));
            });
        },

        openView: function () { throw new Error('`' + this.constructor + '` does not implement `openView`.'); },
        streamValues: function () { throw new Error('`' + this.constructor + '` does not implement `streamValues`.'); },
        dispose: function () { throw new Error('`' + this.constructor + '` does not implement `dispose`.'); }
    };

    AbstractDataSource.prototype = js.objects.extend({}, {
        'openEntryView': AbstractDataSource.prototype.openEntryView,
        'openOptionalEntryView': AbstractDataSource.prototype.openOptionalEntryView,
        'streamObservables': AbstractDataSource.prototype.streamObservables
    }, AbstractDataSource.prototype);

    /**
     * @constructor
     * @template V, O
     * @extends {de.benshu.ko.dataSource.EntryView<V, O>}
     *
     * @param {de.benshu.ko.dataSource.OptionalEntryView<V, O>} optionalEntryView
     */
    function DefaultEntryView(optionalEntryView) {
        this.__optionalEntryView = optionalEntryView;
        this.__subscription = optionalEntryView.optionalObservable.subscribe(function () {
            throw new Error('Illegal state: A non-optional view for this entry is still open.');
        });
    }

    DefaultEntryView.prototype = {
        get value() { return this.__optionalEntryView.value; },
        get observable() { return this.__optionalEntryView.observable; },
        dispose: function () {
            if (this.__subscription)
                this.__subscription.dispose();
            this.__optionalEntryView.dispose();
        }
    };

    DefaultEntryView.prototype = js.objects.extend({}, {
        get 'value'() { return this.value; },
        get 'observable'() { return this.observable; },
        'dispose': DefaultEntryView.prototype.dispose
    }, DefaultEntryView.prototype);

    /**
     * @constructor
     * @template I, V, O
     * @extends {de.benshu.ko.dataSource.OptionalEntryView<V, O>}
     *
     * @param {de.benshu.ko.dataSource.ObservableEntries<I, V, O>} observableEntries
     * @param {function(V):I} getValueById
     * @param {I} entryId
     */
    function DefaultOptionalEntryView(observableEntries, getValueById, entryId) {
        this.__observableEntries = observableEntries;
        this.__getValueById = getValueById;
        this.__entryId = entryId;

        this.__disposed = false;
        this.__lastKnownValue = getValueById(entryId);

        var sharedObservable = observableEntries.addOptionalReference(this.value);
        this.__observable = sharedObservable();
        this.__optionalObservable = ko.observable({
            'present': true,
            'observable': this.__observable
        });
        this.__subscription = sharedObservable.subscribe(observable => {
            this.__optionalObservable({
                'present': !!observable,
                'observable': observable
            });
        });
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
            return this.__observable;
        },
        get optionalObservable() {
            this.__assertNotDisposed();
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

    DefaultOptionalEntryView.prototype = js.objects.extend({}, {
        get 'value'() { return this.value; },
        get 'observable'() { return this.observable; },
        get 'optionalObservable'() { return this.optionalObservable; },
        'dispose': DefaultOptionalEntryView.prototype.dispose
    }, DefaultOptionalEntryView.prototype);

    var TRUE = function () {return true; };
    var ZERO = function () {return 0; };

    /**
     * @constructor
     * @template V
     *
     * @param {(function(V):boolean|ko.Subscribable<function(V):boolean>)=} predicate
     * @param {(function(V, V):number|ko.Subscribable<function(V, V):number>)=} comparator
     * @param {(number|ko.Subscribable<number>)=} offset
     * @param {(number|ko.Subscribable<number>)=} limit
     */
    function OpenViewKey(predicate, comparator, offset, limit) {
        this.predicate = predicate || TRUE;
        this.comparator = comparator || ZERO;
        this.offset = offset || 0;
        this.limit = limit || limit === 0 ? limit : Number.POSITIVE_INFINITY;

        this.rank = Math.max(
            this.predicate === TRUE ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_FILTERED,
            this.comparator === ZERO ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_SORTED,
            this.offset === 0 && this.limit === Number.POSITIVE_INFINITY ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_CLIPPED
        );
    }

    OpenViewKey.RANK_ROOT = 0;
    OpenViewKey.RANK_FILTERED = 1;
    OpenViewKey.RANK_SORTED = 2;
    OpenViewKey.RANK_CLIPPED = 3;
    OpenViewKey.fromQuery = function (query) {
        return new OpenViewKey(query.predicate, query.comparator, query.offset, query.limit);
    };

    OpenViewKey.prototype = {
        equals: function (other) {
            return this.rank === other.rank
                && this.predicate === other.predicate
                && this.comparator === other.comparator
                && this.offset === other.offset
                && this.limit === other.limit;
        },
        reduceRank: function () {
            if (this.rank <= 0)
                throw new Error('Unsupported operation.');

            var args = [null, this.predicate, this.comparator].slice(0, this.rank);
            /** @type {function(new:OpenViewKey<V>)} */
            var ReducedRankKeyConstructor = OpenViewKey.bind.apply(OpenViewKey, args);
            return new ReducedRankKeyConstructor();
        },
        allRanks: function () {
            return this.rank === 0 ? [this] : this.reduceRank().allRanks().concat([this]);
        },
        applyPrimaryTransformation: function (view) {
            var accessor = [v => v.filteredBy, v => v.sortedBy, v => v.clipped][this.rank - 1];
            var args = [[this.predicate], [this.comparator], [this.offset, this.limit]][this.rank - 1];

            return accessor(view).apply(view, args);
        }
    };

    /**
     * @constructor
     *
     * @param key
     * @param view
     * @param disposer
     */
    function OpenViewReference(key, view, disposer) {
        this.key = key;
        this.view = view;
        this.referenceCount = 1;
        this.disposer = disposer;
    }

    OpenViewReference.prototype = {
        addReference: function () {
            if (this.referenceCount <= 0)
                throw new Error('Assertion error: Reference count at `' + this.referenceCount + '`.');
            ++this.referenceCount;
            return this;
        },
        releaseReference: function () {
            if (--this.referenceCount === 0) {
                this.disposer();
            }
            return this;
        }
    };

    AbstractDataSource.OpenViewKey = OpenViewKey;
    AbstractDataSource.OpenViewReference = OpenViewReference;

    return AbstractDataSource;
});
