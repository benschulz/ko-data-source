/**
 * @constructor
 * @template I, V, O
 */
function DataSource() {}

/**
 * @param {I} entryId
 * @returns {!EntryView<V, O>}
 */
DataSource.prototype.openEntryView = function (entryId) {};

/**
 * @param {I} entryId
 * @returns {!OptionalEntryView<V, O>}
 */
DataSource.prototype.openOptionalEntryView = function (entryId) {};

/**
 * @param {function(QueryConfigurator<V>):Query<V>} queryConfiguration
 * @returns {!View<V, O>}
 */
DataSource.prototype.openView = function (queryConfiguration) {};

/**
 * @param {function(QueryConfigurator<V>):Query<V>} queryConfiguration
 * @returns {!Promise<Stream<O>>}
 */
DataSource.prototype.streamObservables = function (queryConfiguration) {};

/**
 * @param {function(QueryConfigurator<V>):Query<V>} queryConfiguration
 * @returns {!Promise<Stream<V>>}
 */
DataSource.prototype.streamValues = function (queryConfiguration) {};

/**
 * @returns {undefined}
 */
DataSource.prototype.dispose = function (queryConfiguration) {};
