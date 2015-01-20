'use strict';

define(['knockout', 'onefold-js', 'indexed-list', '../delta', './subviews'], function (ko, js, IndexedList, Delta, subviews) {
    function AbstractView(parent, indexedValues, deltas) {
        this.parent = parent;
        this.indexedValues = indexedValues || new IndexedList(this.idSelector);
        this.deltas = deltas || ko.observable(new Delta());

        this._values = ko.observable(this.indexedValues.readOnly());
        this._observables = null;
    }

    AbstractView.prototype = {
        get idSelector() {
            return this.parent.idSelector;
        },
        get observableEntries() { return this.parent.observableEntries; },

        get getValues() { return this._values; },
        get getObservables() {
            if (!this._observables)
                this._observables = ko.observable(this.indexedValues.map(this.observableEntries.addReference));
            return this._observables;
        },
        get values() { return this.getValues; },
        get observables() {return this.getObservables; },

        synchronizeObservables: function (delta) {
            this._values.valueHasMutated();

            if (this._observables) {
                delta.added.forEach(this.observableEntries.addReference);
                this._observables(this.indexedValues.map(this.observableEntries.lookup));
                delta.removed.forEach(this.observableEntries.releaseReference);
            }
        },
        releaseObservableReferences: function () {
            if (this._observables)
                this.indexedValues.forEach(this.observableEntries.releaseReference);
        },

        filteredBy: function (predicate) { return new subviews.FilteredView(this, predicate); },
        orderedBy: function (ordering) { return new subviews.OrderedView(this, ordering); },
        clipped: function (offset, size) { return new subviews.ClippedView(this, offset, size); },

        dispose: function () { this['dispose'](); }
    };

    Object.defineProperty(AbstractView.prototype, 'values', {
        'enumerable': true,
        'get': function () { return this.getValues; }
    });
    Object.defineProperty(AbstractView.prototype, 'observables', {
        'enumerable': true,
        'get': function () { return this.getObservables; }
    });
    AbstractView.prototype['filteredBy'] = AbstractView.prototype.filteredBy;
    AbstractView.prototype['orderedBy'] = AbstractView.prototype.orderedBy;
    AbstractView.prototype['clipped'] = AbstractView.prototype.clipped;

    return AbstractView;
});