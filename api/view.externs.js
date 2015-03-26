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
