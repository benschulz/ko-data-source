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

        var rootView = new views.RootView(this.__idSelector, this.__observableEntries, this.__values, this.__deltas);
        this.__rootView = this.__addOpenViewReference(new AbstractDataSource.OpenViewKey(), rootView);

        this.__size = ko.pureComputed(() => rootView.values().length);
    }

    ClientSideDataSource.prototype = {
        get size() { return this.__size; },

        __addOpenViewReference: function (key, view) {
            var ref = new AbstractDataSource.OpenViewReference(key, view, () => this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1));
            this.__openViewReferences.push(ref);
            return ref;
        },
        __increaseReferenceCountOrOpenNewView: function (key) {
            var existing = js.arrays.singleOrNull(this.__openViewReferences, v => key.equals(v.key));

            if (existing)
                return existing.addReference();
            else {
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
            var key = AbstractDataSource.OpenViewKey.fromQuery(query);

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
                return Promise.resolve(new ListStream(view.values.peek().slice()));
            } finally {
                view.dispose();
            }
        },
        updateEntries: function (updatedEntries) {
            this.__values.updateAll(updatedEntries);
            new Delta([], updatedEntries).propagateTo(this.__deltas);
            this.__observableEntries.updateEntries(updatedEntries);
        },

        dispose: function () {
            this.__rootView.releaseReference();

            if (this.__openViewReferences.length) {
                var views = this.__openViewReferences.length;
                var referenceCount = this.__openViewReferences.reduce((c, r) => c + r.referenceCount, 0);
                window.console.warn('Some views were not or are not yet disposed (' + views + ' views, ' + referenceCount + ' references).');
            }
        }
    };

    ClientSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, {
        get 'size'() { return this.size; },

        'addEntries': ClientSideDataSource.prototype.addEntries,
        'dispose': ClientSideDataSource.prototype.dispose,
        'addOrUpdateEntries': ClientSideDataSource.prototype.addOrUpdateEntries,
        'openView': ClientSideDataSource.prototype.openView,
        'removeEntries': ClientSideDataSource.prototype.removeEntries,
        'replaceEntries': ClientSideDataSource.prototype.replaceEntries,
        'streamValues': ClientSideDataSource.prototype.streamValues,
        'updateEntries': ClientSideDataSource.prototype.updateEntries
    }, ClientSideDataSource.prototype);

    var NO_DIRTY = ko.pureComputed(() => false);

    /**
     * @constructor
     * @template V, O
     * @extends {de.benshu.ko.dataSource.View<V, O>}
     *
     * @param internalView
     * @param internalViewRefs
     */
    function InternalViewAdapter(internalView, internalViewRefs) {
        this.__internalView = internalView;
        this.__internalViewRefs = internalViewRefs;
        this.__size = ko.pureComputed(() => internalView.values().length);
        this.__filteredSize = ko.pureComputed(() => {
            var filteredRef = js.arrays.singleOrNull(internalViewRefs, r => r.key.rank === AbstractDataSource.OpenViewKey.RANK_FILTERED)
                || internalViewRefs[0];
            return filteredRef.view.values().length;
        });
    }

    InternalViewAdapter.prototype = {
        get dirty() { return NO_DIRTY; },
        get filteredSize() { return this.__filteredSize; },
        get metadata() { return ko.pureComputed(() => ({})); },
        get observables() { return this.__internalView.observables; },
        get size() { return this.__size; },
        get values() { return this.__internalView.values; },

        dispose: function () {
            this.__internalViewRefs.forEach(r => {
                r.releaseReference();
            });
        }
    };

    InternalViewAdapter.prototype = js.objects.extend({
        get 'dirty'() { return this.dirty; },
        get 'filteredSize'() { return this.filteredSize; },
        get 'metadata'() { return this.metadata; },
        get 'observables'() { return this.observables; },
        get 'size'() { return this.size; },
        get 'values'() { return this.values; },

        'dispose': InternalViewAdapter.prototype.dispose
    }, InternalViewAdapter.prototype);

    return ClientSideDataSource;
});
