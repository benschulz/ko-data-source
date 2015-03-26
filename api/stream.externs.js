/**
 * @constructor
 * @template T
 */
function Stream() {}

/**
 * @param {function(T)} action
 * @returns {undefined}
 */
Stream.prototype.forEach = function (action) {};

/**
 * @template I
 * @param {function(T):I} mapper
 * @returns {Stream<I>}
 */
Stream.prototype.map = function (mapper) {};

/**
 * @param {function(T, T):T} accumulator
 * @param {T=} identity
 * @returns {T}
 */
// TODO return a promise of the result.. need a small promise lib.. i really like pacta
Stream.prototype.reduce = function (accumulator, identity) {};
