

/** @namespace */
de.benshu.ko.dataSource = {};


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


/**
 * @summary A view of a single data source entry.
 *
 * @constructor
 * @template V, O
 */
de.benshu.ko.dataSource.EntryView = function () {};

/**
 * @summary The entry's value.
 *
 * @type {V}
 */
de.benshu.ko.dataSource.EntryView.prototype.value;

/**
 * @summary A subscribable of the entry's observable.
 *
 * @type {ko.Subscribable<O>}
 */
de.benshu.ko.dataSource.EntryView.prototype.observable;

/**
 * @summary Disposes of this entry view.
 *
 * @returns {undefined}
 */
de.benshu.ko.dataSource.EntryView.prototype.dispose = function () {};


/**
 * @constructor
 * @template I, V, O
 *
 * @param {function(V):I} idSelector
 * @param {de.benshu.ko.dataSource.ObservableStateTransitioner<V, O>} observableStateTransitioner
 */
de.benshu.ko.dataSource.ObservableEntries = function(idSelector, observableStateTransitioner) {};


/**
 * @constructor
 * @template V, O
 */
de.benshu.ko.dataSource.ObservableStateTransitioner = function () {};

/**
 * @param {V} value
 * @returns {O}
 */
de.benshu.ko.dataSource.ObservableStateTransitioner.prototype.constructor = function (value) {};

/**
 * @param {O} observable
 * @param {V} updatedValue
 * @returns {O}
 */
de.benshu.ko.dataSource.ObservableStateTransitioner.prototype.updater = function (observable, updatedValue) {};

/**
 * @param {O} observable
 * @returns {undefined}
 */
de.benshu.ko.dataSource.ObservableStateTransitioner.prototype.destructor = function (observable) {};


/**
 * @constructor
 * @template V, O
 * @extends {de.benshu.ko.dataSource.EntryView<V, O>}
 */
de.benshu.ko.dataSource.OptionalEntryView = function () {};

/**
 * @type {ko.Subscribable<OptionalObservable<O>>}
 */
de.benshu.ko.dataSource.OptionalEntryView.prototype.optionalObservable;

/**
 * @constructor
 * @template O
 */
de.benshu.ko.dataSource.OptionalEntryView.OptionalObservable = function () {};

/**
 * @type {boolean}
 */
de.benshu.ko.dataSource.OptionalEntryView.OptionalObservable.prototype.present;

/**
 * @type {O}
 */
de.benshu.ko.dataSource.OptionalEntryView.OptionalObservable.prototype.observable;


/**
 * @constructor
 * @template V
 */
de.benshu.ko.dataSource.Query = function () {};

/**
 * @constructor
 * @template V
 * @extends {de.benshu.ko.dataSource.Query<V>}
 */
de.benshu.ko.dataSource.LimitableQueryConfigurator = function () {};

/**
 * @param limit
 * @returns {de.benshu.ko.dataSource.Query<V>}
 */
de.benshu.ko.dataSource.LimitableQueryConfigurator.prototype.limitedTo = function (limit) {};

/**
 * @constructor
 * @template V
 * @extends {de.benshu.ko.dataSource.LimitableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.OffsettableQueryConfigurator = function () {};

/**
 * @param offset
 * @returns {de.benshu.ko.dataSource.FilterableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.OffsettableQueryConfigurator.prototype.offsetBy = function (offset) {};

/**
 * @constructor
 * @template V
 * @extends {de.benshu.ko.dataSource.OffsettableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.SortableQueryConfigurator = function () {};

/**
 * @param comparator
 * @returns {de.benshu.ko.dataSource.OffsettableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.SortableQueryConfigurator.prototype.sortedBy = function (comparator) {};

/**
 * @constructor
 * @template V
 * @extends {de.benshu.ko.dataSource.SortableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.FilterableQueryConfigurator = function () {};

/**
 * @param predicate
 * @returns {de.benshu.ko.dataSource.FilterableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.FilterableQueryConfigurator.prototype.filteredBy = function (predicate) {};

/**
 * @constructor
 * @template V
 * @extends {de.benshu.ko.dataSource.FilterableQueryConfigurator<V>}
 */
de.benshu.ko.dataSource.QueryConfigurator = function () {};


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


/**
 * @constructor
 * @template V, O
 */
de.benshu.ko.dataSource.View = function() {};

/**
 * @type {ko.Subscribable<boolean>}
 */
de.benshu.ko.dataSource.View.prototype.dirty;

/**
 * @type {ko.Subscribable<number>}
 */
de.benshu.ko.dataSource.View.prototype.filteredSize;

/**
 * @type {!ko.Subscribable<onefold.lists.List<O>>}
 */
de.benshu.ko.dataSource.View.prototype.observables;

/**
 * @type {!ko.Subscribable<onefold.lists.List<V>>}
 */
de.benshu.ko.dataSource.View.prototype.values;

/**
 * @type {ko.Subscribable<number>}
 */
de.benshu.ko.dataSource.View.prototype.size;

/**
 * @returns {undefined}
 */
de.benshu.ko.dataSource.View.prototype.dispose = function () {};
