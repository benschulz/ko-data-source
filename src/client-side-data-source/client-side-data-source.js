'use strict';

define(function (require) {
    var ko = require('knockout'),
        js = require('onefold-js'),
    //
        views = require('./views/views'),
    //
        AbstractDataSource = require('../abstract-data-source'),
        Delta = require('./delta'),
        IndexedList = require('indexed-list'),
        ListStream = require('../streams/list-stream'),
        QueryConfigurator = require('../queries/query-configurator');

    /**
     * @constructor
     * @template I, V, O
     * @extends {de.benshu.ko.dataSource.DataSource<I, V, O>}
     */
    function ClientSideDataSource(idSelector, observableEntries) {
        var values = new IndexedList(idSelector);

        AbstractDataSource.call(this, observableEntries, entryId => values.getById(entryId));

        this.__idSelector = idSelector;
        this.__observableEntries = observableEntries;
        this.__values = values;
        this.__deltas = ko.observable(new Delta());
        this.__openViewReferences = [];

        this.__addOpenViewReference(new OpenViewKey(), new views.RootView(this.__idSelector, this.__observableEntries, this.__values, this.__deltas));
    }

    ClientSideDataSource.prototype = {
        __addOpenViewReference: function (key, view) {
            var ref = new OpenViewReference(key, view, () => this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1));
            this.__openViewReferences.push(ref);
            return ref;
        },
        __increaseReferenceCountOrOpenNewView: function (key) {
            var existing = js.arrays.singleOrNull(this.__openViewReferences, v => key.equals(v.key));

            if (existing) {
                ++existing.referenceCount;
                return existing;
            } else {
                var parentKey = key.reduceRank();
                var parentView = js.arrays.single(this.__openViewReferences, v => parentKey.equals(v.key)).view;
                var view = key.applyPrimaryTransformation(parentView);
                return this.__addOpenViewReference(key, view);
            }
        },

        addEntries: function (newEntries) {
            this.__values.addAll(newEntries);
            new Delta(newEntries).propagateTo(this.__deltas);
        },
        addOrUpdateEntries: function (entries) {
            var added = [], updated = [];
            entries.forEach(entry => (this.__values.contains(entry) ? updated : added).push());
            new Delta(added, updated).propagateTo(this.__deltas);
        },
        openView: function (queryConfiguration) {
            var query = (queryConfiguration || (x => x))(new QueryConfigurator());
            var key = OpenViewKey.fromQuery(query);

            var internalViewRefs = key.allRanks().map(k => this.__increaseReferenceCountOrOpenNewView(k));

            var internalView = internalViewRefs[internalViewRefs.length - 1].view;
            internalView.forceUpdateIfNecessary();
            return new InternalViewAdapter(internalView, internalViewRefs);
        },
        removeEntries: function (entries) {
            this.__values.removeAll(entries);
            new Delta([], [], entries).propagateTo(this.__deltas);
        },
        replaceEntries: function (newEntries) {
            var removedEntries = this.__values.toArray();
            this.__values.clear();
            this.__values.addAll(newEntries);
            new Delta(newEntries, [], removedEntries).propagateTo(this.__deltas);
            // TODO update only those that were already there before the delta was propagated
            this.__observableEntries.updateEntries(newEntries);
        },
        streamValues: function (queryConfiguration) {
            var view = this.openView(queryConfiguration);
            try {
                /** @type {?} */
                var untypedValues = view.values;
                /** @type {function():onefold.lists.List<?>} */
                var values = untypedValues;
                return Promise.resolve(new ListStream(values().slice()));
            } finally {
                view.dispose();
            }
        },
        updateEntries: function (updatedEntries) {
            this.__values.updateAll(updatedEntries);
            new Delta([], updatedEntries).propagateTo(this.__deltas);
            this.__observableEntries.updateEntries(updatedEntries);
        }
        // TODO implement dispose
    };

    ClientSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, ClientSideDataSource.prototype, {
        'addEntries': ClientSideDataSource.prototype.addEntries,
        'dispose': ClientSideDataSource.prototype.dispose,
        'addOrUpdateEntries': ClientSideDataSource.prototype.addOrUpdateEntries,
        'openView': ClientSideDataSource.prototype.openView,
        'removeEntries': ClientSideDataSource.prototype.removeEntries,
        'replaceEntries': ClientSideDataSource.prototype.replaceEntries,
        'streamValues': ClientSideDataSource.prototype.streamValues,
        'updateEntries': ClientSideDataSource.prototype.updateEntries
    });

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
            this.predicate === TRUE ? 0 : 1,
            this.comparator === ZERO ? 0 : 2,
            this.offset === 0 && this.limit === Number.POSITIVE_INFINITY ? 0 : 3
        );
    }

    OpenViewKey.fromQuery = function (query) {
        return new OpenViewKey(query._predicate, query._comparator, query._offset, query._limit);
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
        },
        releaseReference: function () {
            if (--this.referenceCount === 0) {
                this.disposer();
            }
        }
    };

    /**
     * @constructor
     * @template V, O
     * @extends {View<V, O>}
     *
     * @param internalView
     * @param internalViewRefs
     */
    function InternalViewAdapter(internalView, internalViewRefs) {
        this.__internalView = internalView;
        this.__internalViewRefs = internalViewRefs;
    }

    InternalViewAdapter.prototype = {
        get values() { return this.__internalView.values; },
        get observables() { return this.__internalView.observables; },

        dispose: function () {
            this.__internalViewRefs.forEach(r => {
                r.releaseReference();
            });
        }
    };

    InternalViewAdapter.prototype = js.objects.extend({
        get 'values'() { return this.values; },
        get 'observables'() { return this.observables; },

        'dispose': InternalViewAdapter.prototype.dispose
    }, InternalViewAdapter.prototype);

    return ClientSideDataSource;
});
