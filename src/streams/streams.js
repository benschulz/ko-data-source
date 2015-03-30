'use strict';

define(['onefold-lists', './list-stream'], function (lists, ListStream) {
    return {
        'streamArray': function (array) {
            return new ListStream(lists.newArrayList(array));
        }
    };
});
