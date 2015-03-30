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
