'use strict';

define(['knockout', 'onefold-js', '../delta', './abstract-view', './subviews'], function (ko, js, Delta, AbstractView, subviews) {
    function filterDelta(idSelector, indexedValues, delta, predicate) {
        var added = delta.added.filter(predicate);
        var updated = [];
        var deleted = delta.removed.filter(predicate);

        for (var i = 0, j = delta.updated.length; i < j; i++) {
            var entry = delta.updated[i];
            var contained = indexedValues.containsById(idSelector(entry));

            if (predicate(entry))
                if (contained)
                    updated.push(entry);
                else
                    added.push(entry);
            else if (contained)
                deleted.push(entry);
        }

        return new Delta(added, updated, deleted);
    }

    function FilteredView(parent, predicate) {
        AbstractView.call(this, parent);

        var privateRecomputeTrigger = ko.observable(ko.unwrap(predicate));
        this._forceUpdateIfNecessary = () => privateRecomputeTrigger(ko.unwrap(predicate));

        this.__computer = ko.computed(() => {
            privateRecomputeTrigger();
            var p = ko.unwrap(predicate);
            privateRecomputeTrigger(p);

            var oldValues = this._indexedValues.toArray();
            var newValues = this._parent._indexedValues.filter(p).toArray();
            var delta = new Delta(newValues, [], oldValues);

            this._indexedValues.clear();
            this._indexedValues.addAll(newValues);
            this._synchronizeObservables(delta);

            delta.propagateTo(this._deltas);
        });
        this.__deltaSubscription = parent._deltas.subscribe(delta => {
            var filtered = filterDelta(this._idSelector, this._indexedValues, delta, ko.unwrap(predicate));
            if (filtered.empty)
                return;

            this._indexedValues.removeAll(filtered.removed);
            this._indexedValues.updateAll(filtered.updated);
            this._indexedValues.addAll(filtered.added);
            this._synchronizeObservables(delta);

            filtered.propagateTo(this._deltas);
        });
    }

    FilteredView.prototype = js.objects.extend({}, AbstractView.prototype, {
        dispose: function () {
            this.__computer.dispose();
            this.__deltaSubscription.dispose();
            this._releaseObservableReferences();
        }
    });

    subviews.FilteredView = FilteredView;
    return FilteredView;
});
