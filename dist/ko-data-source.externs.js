

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

/**
 * @constructor
 * @template V, O
 */
function EntryView() {}

/**
 * @type {V}
 */
EntryView.prototype.value;

/**
 * @type {O}
 */
EntryView.prototype.observable;

/**
 * @returns {undefined}
 */
EntryView.prototype.dispose = function () {};

/**
 * @namespace
 */
var koDataSource = {};

/**
 * @constructor
 * @template I, V, O
 * @param {function(V):I} idSelector
 * @param {ObservableEntries<I, V, O>} observableEntries
 */
koDataSource.ClientSideDataSource = function (idSelector, observableEntries) {};

/**
 * @constructor
 * @template I, V, O
 * @param {function(V):I} idSelector
 * @param {ObservableStateTransitioner<V, O>} observableStateTransitioner
 */
koDataSource.ObservableEntries = function (idSelector, observableStateTransitioner) {};

/**
 * @constructor
 * @template I, V, O
 *
 * @param {function(V):I} idSelector
 * @param {ObservableStateTransitioner<V, O>} observableStateTransitioner
 */
function ObservableEntries(idSelector, observableStateTransitioner) {}

/**
 * @constructor
 * @template V, O
 */
function ObservableStateTransitioner() {}

/**
 * @param {V} value
 * @returns {O}
 */
ObservableStateTransitioner.prototype.constructor = function (value) {};

/**
 * @param {O} observable
 * @param {V} updatedValue
 * @returns {O}
 */
ObservableStateTransitioner.prototype.updater = function (observable, updatedValue) {};

/**
 * @param {O} observable
 * @returns {undefined}
 */
ObservableStateTransitioner.prototype.destructor = function (observable) {};

/**
 * @constructor
 * @template V, O
 * @extends {EntryView<V, O>}
 */
function OptionalEntryView() {}

/**
 * @type {ko.Subscribable<OptionalObservable<O>>}
 */
OptionalEntryView.prototype.optionalObservable;

/**
 * @constructor
 * @template O
 */
function OptionalObservable() {}

/**
 * @type {boolean}
 */
OptionalObservable.prototype.present;

/**
 * @type {O}
 */
OptionalObservable.prototype.observable;

/**
 * @constructor
 * @template V
 */
function Query() {}

/**
 * @constructor
 * @template V
 * @extends {Query<V>}
 */
function LimitableQueryConfigurator() {}

/**
 * @param limit
 * @returns {Query<V>}
 */
LimitableQueryConfigurator.prototype.limitedTo = function (limit) {};

/**
 * @constructor
 * @template V
 * @extends {LimitableQueryConfigurator<V>}
 */
function OffsettableQueryConfigurator() {}

/**
 * @param offset
 * @returns {FilterableQueryConfigurator<V>}
 */
OffsettableQueryConfigurator.prototype.offsetBy = function (offset) {};

/**
 * @constructor
 * @template V
 * @extends {OffsettableQueryConfigurator<V>}
 */
function SortableQueryConfigurator() {}

/**
 * @param comparator
 * @returns {OffsettableQueryConfigurator<V>}
 */
SortableQueryConfigurator.prototype.sortedBy = function (comparator) {};

/**
 * @constructor
 * @template V
 * @extends {SortableQueryConfigurator<V>}
 */
function FilterableQueryConfigurator() {}

/**
 * @param predicate
 * @returns {FilterableQueryConfigurator<V>}
 */
FilterableQueryConfigurator.prototype.filteredBy = function (predicate) {};

/**
 * @constructor
 * @template V
 * @extends {FilterableQueryConfigurator<V>}
 */
function QueryConfigurator() {}

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

/**
 * @constructor
 * @template V, O
 */
function View() {}

/**
 * @type {!ko.Subscribable<onefold.lists.List<V>>}
 */
View.prototype.values;

/**
 * @type {!ko.Subscribable<onefold.lists.List<O>>}
 */
View.prototype.observables;

/**
 * @returns {undefined}
 */
View.prototype.dispose = function () {};