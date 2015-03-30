

/**
 * @constructor
 * @template I, V, O
 */
de.benshu.ko.dataSource.DataSource = function () {};

/**
 * @type {ko.Subscribable<number>}
 */
de.benshu.ko.dataSource.DataSource.prototype.size;

/**
 * @param {I} entryId
 * @returns {!de.benshu.ko.dataSource.EntryView<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openEntryView = function (entryId) {};

/**
 * @param {I} entryId
 * @returns {!de.benshu.ko.dataSource.OptionalEntryView<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openOptionalEntryView = function (entryId) {};

/**
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 * @returns {!de.benshu.ko.dataSource.View<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openView = function (queryConfiguration) {};

/**
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 * @returns {!Promise<de.benshu.ko.dataSource.streams.Stream<O>>}
 */
de.benshu.ko.dataSource.DataSource.prototype.streamObservables = function (queryConfiguration) {};

/**
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 * @returns {!Promise<de.benshu.ko.dataSource.streams.Stream<V>>}
 */
de.benshu.ko.dataSource.DataSource.prototype.streamValues = function (queryConfiguration) {};

/**
 * @returns {undefined}
 */
de.benshu.ko.dataSource.DataSource.prototype.dispose = function (queryConfiguration) {};
