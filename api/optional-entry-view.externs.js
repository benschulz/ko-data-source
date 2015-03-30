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
