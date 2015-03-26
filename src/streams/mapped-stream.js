'use strict';

define(['onefold-js'], function (js) {
    /**
     * @constructor
     * @template D, I
     * @extends Stream<I>
     *
     * @param {!Stream<D>} sourceStream
     * @param {function(D):I} mapper
     * @param {function(I)=} closer
     */
    function MappedStream(sourceStream, mapper, closer) {
        this.__sourceStream = sourceStream;

        this.__evaluator = closer
            ? (action, sourceElement) => {
                var resource = mapper(sourceElement);
                try {
                    return action(resource);
                } finally {
                    closer(resource);
                }
            }
            : (action, sourceElement) =>
                action(mapper(sourceElement));
    }

    MappedStream.prototype = {
        forEach: function (action) {
            this.__sourceStream.forEach(this.__evaluator.bind(null, action));
        },
        map: function (mapper) {
            return new MappedStream(this, mapper);
        },
        reduce: function (accumulator, identity) {
            return this.__sourceStream.reduce((a, b) => {
                return accumulator(a, this.__evaluator(x => x, b));
            }, identity);
        }
    };

    var proto = MappedStream.prototype;
    js.objects.extend(proto, {
        'forEach': proto.forEach,
        'map': proto.map,
        'reduce': proto.reduce
    });

    return MappedStream;
});
