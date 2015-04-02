/**
 * @summary Represents a collection of similarly shaped objects (e.g. a collection of users).
 *
 * @constructor
 * @template I, V, O
 */
de.benshu.ko.dataSource.DataSource = function () {};

/**
 * The size of the data source.
 *
 * The size is updated whenever possible. For remote data sources this translates into *whenever a view is updated*.
 *
 * @type {ko.Subscribable<number>}
 */
de.benshu.ko.dataSource.DataSource.prototype.size;

/**
 * Use `openOptionalEntryView` if the element can vanish from the data source while the view is open.
 *
 * @summary Opens an entry view for the entry with the specified id.
 *
 * @param {I} entryId
 * @returns {!de.benshu.ko.dataSource.EntryView<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openEntryView = function (entryId) {};

/**
 * The *optional*-part allows for the entry to drop out of the data source while the view is open.
 * It does not mean that the entry can be absent from the data source when this method is called.
 *
 * @summary Opens an optional entry view for the entry with the specified id.
 *
 * @param {I} entryId
 * @returns {!de.benshu.ko.dataSource.OptionalEntryView<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openOptionalEntryView = function (entryId) {};

/**
 * @summary Opens a view of the entries in this data source.
 *
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 *        A configuration of the view to be returned.
 * @returns {!de.benshu.ko.dataSource.View<V, O>}
 */
de.benshu.ko.dataSource.DataSource.prototype.openView = function (queryConfiguration) {};

/**
 *
 * @summary Promises a stream of entry observables.
 *
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 * @returns {!Promise<de.benshu.ko.dataSource.streams.Stream<O>>}
 */
de.benshu.ko.dataSource.DataSource.prototype.streamObservables = function (queryConfiguration) {};

/**
 * @summary Promises a stream of entry values.
 *
 * @param {function(de.benshu.ko.dataSource.QueryConfigurator<V>):de.benshu.ko.dataSource.Query<V>} queryConfiguration
 * @returns {!Promise<de.benshu.ko.dataSource.streams.Stream<V>>}
 */
de.benshu.ko.dataSource.DataSource.prototype.streamValues = function (queryConfiguration) {};

/**
 * @summary Disposes of this data source.
 *
 * @returns {undefined}
 */
de.benshu.ko.dataSource.DataSource.prototype.dispose = function (queryConfiguration) {};
