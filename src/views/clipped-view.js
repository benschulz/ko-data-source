'use strict';

define(['knockout', 'onefold-js', 'onefold-lists', './subviews'], function (ko, js, lists, subviews) {
    function checkForChanges(idSelector, oldValues, newValues) {
        if (oldValues.length !== newValues.length)
            return true;

        for (var i = oldValues.length - 1; i >= 0; --i) {
            if (idSelector(oldValues.get(i)) !== idSelector(newValues.get(i)))
                return true;
        }

        return false;
    }

    // TODO this actually duplicates some tiny parts of AbstractView... consolidate somehow? (the prototypes are interesting too, perhaps more so)
    function ClippedView(parent, offset, size) {
        var observableEntries = parent.observableEntries;
        this.__observableEntries = observableEntries;
        this.__values = ko.observable(lists.newArrayList());
        this.__observables = null;

        var idSelector = parent.idSelector;

        this.computer = ko.computed(() => {
            // the delta isn't worth much to clipping, so we reuse the computer
            parent.deltas();

            var unclipped = parent.indexedValues;
            var from = Math.min(unclipped.length, ko.unwrap(offset));
            var to = Math.min(unclipped.length, from + ko.unwrap(size));

            var oldValues = this.__values.peek();
            var newValues = unclipped.slice(from, to);

            if (checkForChanges(idSelector, oldValues, newValues)) {
                this.__values(newValues);

                if (this.__observables) {
                    this.__observables(this.__values.peek().map(observableEntries.addReference));
                    oldValues.forEach(observableEntries.releaseReference);
                }
            }
        });
    }

    ClippedView.prototype = js.functions.identity({
        get getValues() { return this.__values; },
        get getObservables() {
            if (!this.__observables)
                this.__observables = ko.observable(this.values().map(this.__observableEntries.addReference));
            return this.__observables;
        },
        get values() { return this.getValues; },
        get observables() {return this.getObservables; },

        filteredBy: function () { throw new Error('Filtering a clipped view is not supported.'); },
        orderedBy: function () { throw new Error('Ordering a clipped view is not supported.'); },
        clipped: function () { throw new Error('Clipping a clipped view is not supported.'); },
        dispose: function () {
            this.computer.dispose();
            if (this.__observables)
                this.__values().forEach(this.__observableEntries.releaseReference);
        }
    });

    Object.defineProperty(ClippedView.prototype, 'values', {
        'enumerable': true,
        'get': function () { return this.getValues; }
    });
    Object.defineProperty(ClippedView.prototype, 'observables', {
        'enumerable': true,
        'get': function () { return this.getObservables; }
    });
    ClippedView.prototype['filteredBy'] = ClippedView.prototype.filteredBy;
    ClippedView.prototype['orderedBy'] = ClippedView.prototype.orderedBy;
    ClippedView.prototype['clipped'] = ClippedView.prototype.clipped;
    ClippedView.prototype['dispose'] = ClippedView.prototype.dispose;

    subviews.ClippedView = ClippedView;
    return ClippedView;
});
