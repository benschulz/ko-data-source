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
