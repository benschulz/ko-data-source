'use strict';

define(['onefold-js', './sortable-query-configurator'], function (js, SortableQueryConfigurator) {
    function FilterableQueryConfigurator() {
        SortableQueryConfigurator.call(this);
    }

    var proto = {
        filteredBy: function (predicate) {
            return new SortableQueryConfigurator(predicate);
        }
    };

    FilterableQueryConfigurator.prototype = js.objects.extend({}, SortableQueryConfigurator.prototype, proto, {
        'filteredBy': proto.filteredBy
    });

    return FilterableQueryConfigurator;
});
