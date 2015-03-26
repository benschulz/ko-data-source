'use strict';

define(['knockout', 'onefold-js', 'indexed-list', '../delta', './subviews'], function (ko, js, IndexedList, Delta, subviews) {
    function AbstractView(parent, indexedValues, deltas) {
        this._parent = parent;
        this._indexedValues = indexedValues || new IndexedList(parent._idSelector);
        this._deltas = deltas || ko.observable(new Delta());

        this._values = ko.observable(this._indexedValues.readOnly());
        this._observables = null;
    }

    AbstractView.prototype = {
        get _idSelector() { return this._parent._idSelector; },
        get _observableEntries() { return this._parent._observableEntries; },

        get values() { return this._values; },
        get observables() {
            if (!this._observables)
                this._observables = ko.observable(this._indexedValues.map(this._observableEntries.addReference));
            return this._observables;
        },

        _synchronizeObservables: function (delta) {
            this._values.valueHasMutated();

            if (this._observables) {
                delta.added.forEach(this._observableEntries.addReference);
                this._observables(this._indexedValues.map(this._observableEntries.lookup));
                delta.removed.forEach(this._observableEntries.releaseReference);
            }
        },
        _releaseObservableReferences: function () {
            if (this._observables)
                this._indexedValues.forEach(this._observableEntries.releaseReference);
        },
        forceUpdateIfNecessary: function () {
            this._parent.forceUpdateIfNecessary();
            this._forceUpdateIfNecessary();
        },

        filteredBy: function (predicate) { return new subviews.FilteredView(this, predicate); },
        sortedBy: function (comparator) { return new subviews.SortedView(this, comparator); },
        clipped: function (offset, size) { return new subviews.ClippedView(this, offset, size); }
    };

    return AbstractView;
});