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
