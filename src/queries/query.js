'use strict';

define(function () {
    function Query(predicate, comparator, offset, limit) {
        this._predicate = predicate;
        this._comparator = comparator;
        this._offset = offset;
        this._limit = limit;
    }

    return Query;
});
