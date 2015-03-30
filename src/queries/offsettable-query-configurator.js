'use strict';

define(['onefold-js', './limitable-query-configurator'], function (js, LimitableQueryConfigurator) {
    function OffsettableQueryConfigurator(predicate, comparator) {
        LimitableQueryConfigurator.call(this, predicate, comparator);
    }

    var proto = {
        offsetBy: function (offset) {
            return new LimitableQueryConfigurator(this.predicate, this.comparator, offset);
        }
    };

    OffsettableQueryConfigurator.prototype = js.objects.extend({}, LimitableQueryConfigurator.prototype, proto, {
        'offsetBy': proto.offsetBy
    });

    return OffsettableQueryConfigurator;
});
