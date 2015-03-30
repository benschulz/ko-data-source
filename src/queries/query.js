'use strict';

define(['knockout', 'onefold-js'], function (ko, js) {
    /**
     * @constructor
     * @extends {de.benshu.ko.dataSource.Query}
     */
    function Query(predicate, comparator, offset, limit) {
        this.__predicate = predicate;
        this.__comparator = comparator;
        this.__offset = offset;
        this.__limit = limit;
    }

    Query.prototype = js.objects.extend({
        get 'predicate'() { return this.predicate; },
        get 'comparator'() { return this.comparator; },
        get 'offset'() { return this.offset; },
        get 'limit'() { return this.limit; }
    }, {
        get predicate() { return this.__predicate; },
        get comparator() { return this.__comparator; },
        get offset() { return this.__offset; },
        get limit() { return this.__limit; },

        normalize: function () {
            return new Query(
                this.predicate || (() => true),
                this.comparator || (() => 0),
                this.offset || 0,
                this.limit || this.limit === 0 ? this.limit : Number.POSITIVE_INFINITY
            );
        },
        unwrapArguments: function () {
            return new Query(
                ko.unwrap(this.predicate),
                ko.unwrap(this.comparator),
                ko.unwrap(this.offset),
                ko.unwrap(this.limit)
            );
        },
        equals: function (other) {
            return this.predicate === other.predicate
                && this.comparator === other.comparator
                && this.offset === other.offset
                && this.limit === other.limit;
        }
    });

    return Query;
});
