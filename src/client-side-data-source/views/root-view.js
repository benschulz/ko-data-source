'use strict';

define(['knockout', 'onefold-js', './abstract-view'], function (ko, js, AbstractView) {
    function RootView(idSelector, observableEntries, values, deltas) {
        AbstractView.call(this, {_idSelector: idSelector, _observableEntries: observableEntries}, values, deltas);

        this.__deltaSubscription = deltas.subscribe(delta => {
            this._synchronizeObservables(delta);
        });
    }

    RootView.prototype = js.objects.extend({}, AbstractView.prototype, {
        forceUpdateIfNecessary: () => {},
        dispose: function () {
            this.__deltaSubscription.dispose();
            this._releaseObservableReferences();
        }
    });

    return RootView;
});
