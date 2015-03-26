'use strict';

define(['knockout', 'onefold-js', './abstract-view', './subviews'], function (ko, js, AbstractView, subviews) {
    function SortedView(parent, comparator) {
        AbstractView.call(this, parent);

        this._indexedValues.addAll(parent._indexedValues.toArray());

        var privateRecomputeTrigger = ko.observable(ko.unwrap(comparator));
        this._forceUpdateIfNecessary = () => privateRecomputeTrigger(ko.unwrap(comparator));

        this.__computer = ko.computed(() => {
            privateRecomputeTrigger();
            var c = ko.unwrap(comparator);
            privateRecomputeTrigger(c);

            if (this._indexedValues.sortBy(c))
                this._deltas.valueHasMutated();
        });
        this.__deltaSubscription = parent._deltas.subscribe(delta => {
            var failedUpdates = this._indexedValues.tryUpdateAll(delta.updated);
            this._indexedValues.removeAll(delta.removed.concat(failedUpdates));
            this._indexedValues.insertAll(delta.added.concat(failedUpdates));
            this._synchronizeObservables(delta);

            this._deltas.valueHasMutated();
        });
    }

    SortedView.prototype = js.objects.extend({}, AbstractView.prototype, {
        filteredBy: function () { throw new Error('Filtering a sorted view is not supported.'); },
        sortedBy: function () { throw new Error('Sorting a sorted view is not supported.'); },
        dispose: function () {
            this.__computer.dispose();
            this.__deltaSubscription.dispose();
            this._releaseObservableReferences();
        }
    });

    subviews.SortedView = SortedView;
    return SortedView;
});
