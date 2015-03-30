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
