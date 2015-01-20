'use strict';

define(['knockout', 'onefold-js', './abstract-view'], function (ko, js, AbstractView) {
    function RootView(idSelector, observableEntries, values, deltas) {
        AbstractView.call(this, {idSelector: idSelector, observableEntries: observableEntries}, values, deltas);

        this.deltaSubscription = deltas.subscribe(delta => {
            this.synchronizeObservables(delta);
        });
    }

    RootView.prototype = js.objects.extend({}, AbstractView.prototype, {
        'dispose': function () {
            this.deltaSubscription.dispose();
            this.releaseObservableReferences();
        }
    });

    return RootView;
});
