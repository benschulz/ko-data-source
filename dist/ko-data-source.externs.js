

/** @namespace */
de.benshu.ko.dataSource = {};


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


/**
 * @constructor
 * @template V, O
 */
de.benshu.ko.dataSource.EntryView = function () {};

/**
 * @type {V}
 */
de.benshu.ko.dataSource.EntryView.prototype.value;

/**
 * @type {O}
 */
de.benshu.ko.dataSource.EntryView.prototype.observable;

/**
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
