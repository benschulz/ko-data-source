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
