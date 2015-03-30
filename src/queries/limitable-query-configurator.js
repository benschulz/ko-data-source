'use strict';

define(['onefold-js', './query'], function (js, Query) {
    function LimitableQueryConfigurator(predicate, comparator, offset) {
        Query.call(this, predicate, comparator, offset);
    }

    var proto = {
        limitedTo: function (limit) {
            return new Query(this.predicate, this.comparator, this.offset, limit);
        }
    };

    LimitableQueryConfigurator.prototype = js.objects.extend({}, Query.prototype, proto, {
        'limitedTo': proto.limitedTo
    });

    return LimitableQueryConfigurator;
});
