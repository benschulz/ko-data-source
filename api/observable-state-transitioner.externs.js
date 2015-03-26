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
