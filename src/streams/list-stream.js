'use strict';

define(['onefold-js', './mapped-stream'], function (js, MappedStream) {
    /**
     * @constructor
     * @template T
     * @extends {de.benshu.ko.dataSource.streams.Stream<T>}
     */
    function ListStream(list) {
        this.__list = list;
    }

    ListStream.prototype = {
        forEach: function (action) {
            // TODO prevent blocking
            this.__list.forEach(action);
        },
        map: function (mapper) {
            return new MappedStream(this, mapper);
        },
        reduce: function (accumulator, identity) {
            // TODO prevent blocking
            return Promise.resolve(this.__list.reduce(accumulator, identity));
        }
    };

    var proto = ListStream.prototype;
    js.objects.extend(proto, {
        'forEach': proto.forEach,
        'map': proto.map,
        'reduce': proto.reduce
    });

    return ListStream;
});
