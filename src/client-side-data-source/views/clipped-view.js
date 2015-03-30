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

    // TODO rename AbstractView AbstractIndexedView and extract an AbstractView from it to inherit from
    function ClippedView(parent, offset, limit) {
        var observableEntries = parent._observableEntries;
        this.__parent = parent;
        this.__values = ko.observable(lists.newArrayList());
        this.__observables = null;

        var idSelector = parent._idSelector;

        var unwrapArguments = () => ({offset: ko.unwrap(offset), limit: ko.unwrap(limit)});

        var privateRecomputeTrigger = ko.observable(unwrapArguments());
        this._forceUpdateIfNecessary = () => {
            var lastArguments = privateRecomputeTrigger();
            var newArguments = unwrapArguments();
            if (lastArguments.offset !== newArguments.offset || lastArguments.limit !== newArguments.limit)
                privateRecomputeTrigger(newArguments);
        };

        this.__computer = ko.computed(() => {
            // the delta isn't worth much to clipping, so we reuse the __computer
            parent._deltas();

            privateRecomputeTrigger();
            var args = unwrapArguments();
            privateRecomputeTrigger(args);

            var unclipped = parent._indexedValues;
            var from = Math.min(unclipped.length, args.offset);
            var to = Math.min(unclipped.length, from + args.limit);

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

    ClippedView.prototype = {
        get values() { return this.__values; },
        get observables() {
            if (!this.__observables)
                this.__observables = ko.observable(this.values().map(this.__parent._observableEntries.addReference));
            return this.__observables;
        },

        forceUpdateIfNecessary: function () {
            this.__parent.forceUpdateIfNecessary();
            this._forceUpdateIfNecessary();
        },

        filteredBy: function () { throw new Error('Filtering a clipped view is not supported.'); },
        sortedBy: function () { throw new Error('Sorting a clipped view is not supported.'); },
        clipped: function () { throw new Error('Clipping a clipped view is not supported.'); },

        dispose: function () {
            this.__computer.dispose();
            if (this.__observables)
                this.__values().forEach(this.__parent._observableEntries.releaseReference);
        }
    };

    subviews.ClippedView = ClippedView;
    return ClippedView;
});
