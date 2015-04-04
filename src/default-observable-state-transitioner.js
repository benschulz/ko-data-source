'use strict';

define(['knockout'], function (ko) {
    function DefaultObservableStateTransitioner(options) {
        this.__isObservableProperty = false;

        (options && options['observableProperties'] || []).forEach(p => {
            this.__isObservableProperty = this.__isObservableProperty || {};
            this.__isObservableProperty[p] = true;
        });
    }

    DefaultObservableStateTransitioner.prototype = {
        'constructor': function (entry) {
            var isObservableProperty = this.__isObservableProperty;
            if (!isObservableProperty)
                return entry;

            var observable = {};

            Object.keys(entry).forEach(p => {
                if (isObservableProperty && isObservableProperty[p])
                    observable[p] = ko.observable(entry[p]);
                else
                    observable[p] = entry[p];
            });

            return observable;
        },
        'updater': function (observable, updatedEntry) {
            var isObservableProperty = this.__isObservableProperty;
            if (!isObservableProperty)
                return observable;

            Object.keys(updatedEntry)
                .filter(p => isObservableProperty && isObservableProperty[p])
                .forEach(p => observable[p](updatedEntry[p]));

            return observable;
        },
        'destructor': function () {}
    };

    return DefaultObservableStateTransitioner;
});
