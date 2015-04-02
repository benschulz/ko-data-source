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
