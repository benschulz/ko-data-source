/** @namespace */
de.benshu.ko.dataSource.streams = {};

/**
 * @constructor
 * @template T
 */
de.benshu.ko.dataSource.streams.Stream = function () {};

/**
 * @param {function(T)} action
 * @returns {undefined}
 */
de.benshu.ko.dataSource.streams.Stream.prototype.forEach = function (action) {};

/**
 * @template I
 * @param {function(T):I} mapper
 * @returns {de.benshu.ko.dataSource.streams.Stream<I>}
 */
de.benshu.ko.dataSource.streams.Stream.prototype.map = function (mapper) {};

/**
 * @param {function(T, T):T} accumulator
 * @param {T=} identity
 * @returns {Promise<T>}
 */
de.benshu.ko.dataSource.streams.Stream.prototype.reduce = function (accumulator, identity) {};
