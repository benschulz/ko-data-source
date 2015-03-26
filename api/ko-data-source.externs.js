/**
 * @namespace
 */
var koDataSource = {};

/**
 * @constructor
 * @template I, V, O
 * @param {function(V):I} idSelector
 * @param {ObservableEntries<I, V, O>} observableEntries
 */
koDataSource.ClientSideDataSource = function (idSelector, observableEntries) {};

/**
 * @constructor
 * @template I, V, O
 * @param {function(V):I} idSelector
 * @param {ObservableStateTransitioner<V, O>} observableStateTransitioner
 */
koDataSource.ObservableEntries = function (idSelector, observableStateTransitioner) {};