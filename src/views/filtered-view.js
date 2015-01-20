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

        this.computer = ko.computed(() => {
            var oldValues = this.indexedValues.toArray();
            var newValues = this.parent.indexedValues.filter(ko.unwrap(predicate)).toArray();
            var delta = new Delta(newValues, [], oldValues);

            this.indexedValues.clear();
            this.indexedValues.addAll(newValues);
            this.synchronizeObservables(delta);

            delta.propagateTo(this.deltas);
        });
        this.deltaSubscription = parent.deltas.subscribe(delta => {
            var filtered = filterDelta(this.idSelector, this.indexedValues, delta, ko.unwrap(predicate));
            if (filtered.empty)
                return;

            this.indexedValues.removeAll(filtered.removed);
            this.indexedValues.updateAll(filtered.updated);
            this.indexedValues.addAll(filtered.added);
            this.synchronizeObservables(delta);

            filtered.propagateTo(this.deltas);
        });
    }

    FilteredView.prototype = js.objects.extend({}, AbstractView.prototype, {
        'dispose': function () {
            this.computer.dispose();
            this.deltaSubscription.dispose();
            this.releaseObservableReferences();
        }
    });

    subviews.FilteredView = FilteredView;
    return FilteredView;
});
