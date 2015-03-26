'use strict';

define(['onefold-js', './filterable-query-configurator'], function (js, FilterableQueryConfigurator) {
    /**
     * @constructor
     */
    function QueryConfiguratorImpl() {
        FilterableQueryConfigurator.call(this);
    }

    QueryConfiguratorImpl.prototype = js.objects.extend({}, FilterableQueryConfigurator.prototype);

    return QueryConfiguratorImpl;
});
