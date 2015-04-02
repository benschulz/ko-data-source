'use strict';

define(['knockout'], function (ko) {
    return function DefaultObservableStateTransitioner() {
        var isNonObservableProperty = {};
        Array.prototype.slice.call(arguments).forEach(function (property) {
            isNonObservableProperty[property] = true;
        });

        this.constructor = entry => {
            var observable = {};

            Object.keys(entry).forEach(p => {
                if (isNonObservableProperty[p])
                    observable[p] = entry[p];
                else
                    observable[p] = ko.observable(entry[p]);
            });

            return observable;
        };
        this.updater = (observable, updatedEntry) => {
            Object.keys(updatedEntry)
                .filter(p => !isNonObservableProperty[p])
                .forEach(p => observable[p](updatedEntry[p]));

            return observable;
        };
        this.destructor = () => {};
    };
});
