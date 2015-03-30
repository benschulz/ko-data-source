'use strict';

define(['onefold-js', './offsettable-query-configurator'], function (js, OffsettableQueryConfigurator) {
    function SortableQueryConfigurator(predicate) {
        OffsettableQueryConfigurator.call(this, predicate);
    }

    var proto = {
        sortedBy: function (comparator) {
            return new OffsettableQueryConfigurator(this.predicate, comparator);
        }
    };

    SortableQueryConfigurator.prototype = js.objects.extend({}, OffsettableQueryConfigurator.prototype, proto, {
        'sortedBy': proto.sortedBy
    });

    return SortableQueryConfigurator;
});
