'use strict';

define(['knockout', 'onefold-js', './abstract-view', './subviews'], function (ko, js, AbstractView, subviews) {
    function OrderedView(parent, ordering) {
        AbstractView.call(this, parent);

        this.indexedValues.addAll(parent.indexedValues.toArray());
        this.computer = ko.computed(() => {
            if (this.indexedValues.defineOrdering(ko.unwrap(ordering)))
                this.deltas.valueHasMutated();
        });
        this.deltaSubscription = parent.deltas.subscribe(delta => {
            var failedUpdates = this.indexedValues.tryUpdateAll(delta.updated);
            this.indexedValues.removeAll(delta.removed.concat(failedUpdates));
            this.indexedValues.insertAll(delta.added.concat(failedUpdates));
            this.synchronizeObservables(delta);

            this.deltas.valueHasMutated();
        });
    }

    OrderedView.prototype = js.objects.extend({}, AbstractView.prototype, {
        'filteredBy': function () { throw new Error('Filtering an ordered view is not supported.'); },
        'orderedBy': function () { throw new Error('Ordering an ordered view is not supported.'); },
        'dispose': function () {
            this.computer.dispose();
            this.deltaSubscription.dispose();
            this.releaseObservableReferences();
        }
    });

    subviews.OrderedView = OrderedView;
    return OrderedView;
});
