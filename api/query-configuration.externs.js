/**
 * @constructor
 * @template V
 */
function Query() {}

/**
 * @constructor
 * @template V
 * @extends {Query<V>}
 */
function LimitableQueryConfigurator() {}

/**
 * @param limit
 * @returns {Query<V>}
 */
LimitableQueryConfigurator.prototype.limitedTo = function (limit) {};

/**
 * @constructor
 * @template V
 * @extends {LimitableQueryConfigurator<V>}
 */
function OffsettableQueryConfigurator() {}

/**
 * @param offset
 * @returns {FilterableQueryConfigurator<V>}
 */
OffsettableQueryConfigurator.prototype.offsetBy = function (offset) {};

/**
 * @constructor
 * @template V
 * @extends {OffsettableQueryConfigurator<V>}
 */
function SortableQueryConfigurator() {}

/**
 * @param comparator
 * @returns {OffsettableQueryConfigurator<V>}
 */
SortableQueryConfigurator.prototype.sortedBy = function (comparator) {};

/**
 * @constructor
 * @template V
 * @extends {SortableQueryConfigurator<V>}
 */
function FilterableQueryConfigurator() {}

/**
 * @param predicate
 * @returns {FilterableQueryConfigurator<V>}
 */
FilterableQueryConfigurator.prototype.filteredBy = function (predicate) {};

/**
 * @constructor
 * @template V
 * @extends {FilterableQueryConfigurator<V>}
 */
function QueryConfigurator() {}
