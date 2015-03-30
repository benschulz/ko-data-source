'use strict';

define(function (require) {
    var ko = require('knockout'),
        js = require('onefold-js'),
        lists = require('onefold-lists'),
    //
        AbstractDataSource = require('../abstract-data-source'),
        QueryConfigurator = require('../queries/query-configurator');

    var hasOwn = js.objects.hasOwn;

    /**
     * @constructor
     * @template I, V, O
     * @extends {de.benshu.ko.dataSource.DataSource<I, V, O>}
     */
    function ServerSideDataSource(idSelector, observableEntries, querier) {
        var values = {};

        AbstractDataSource.call(this, observableEntries, entryId => {
            if (!hasOwn(values, entryId))
                throw new Error('No known entry with id `' + entryId + '`.');
            return values[entryId].value;
        });

        this.__idSelector = idSelector;
        this.__observableEntries = observableEntries;
        this.__querier = querier;
        this.__values = values;
        this.__size = ko.observable(0);
        this.__computedSize = ko.pureComputed(() => this.__size());
        this.__openViewReferences = [];
    }

    ServerSideDataSource.prototype = {
        get size() { return this.__computedSize; },

        __addValueReference: function (value) {
            var id = this.__idSelector(value);

            if (hasOwn(this.__values, id)) {
                var ref = this.__values[id];
                ++ref.referenceCount;
                ref.value = value;
            } else {
                this.__values[id] = {
                    referenceCount: 1,
                    value: value
                };
            }
        },
        __releaseValueReference: function (value) {
            var id = this.__idSelector(value);

            if (!hasOwn(this.__values, id))
                throw new Error('Assertion error: Value with id `' + id + '` was expected to be referenced.');

            if (--this.__values[id].referenceCount === 0)
                delete this.__values[id];
        },

        openView: function (queryConfiguration) {
            var query = (queryConfiguration || (x => x))(new QueryConfigurator());
            var key = AbstractDataSource.OpenViewKey.fromQuery(query);

            var existing = js.arrays.singleOrNull(this.__openViewReferences, v => key.equals(v.key));

            if (existing)
                return existing.addReference().view;
            else {
                var view = new ServerSideView(this, query, () => ref.releaseReference());
                var ref = new AbstractDataSource.OpenViewReference(key, view, () => this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1));
                this.__openViewReferences.push(ref);

                return view;
            }
        },
        streamValues: function (queryConfiguration) {
            /** @type {?} */
            var query = (queryConfiguration || (x => x))(new QueryConfigurator());
            return this.__querier['issue'](query.unwrapArguments().normalize());
        },

        dispose: function () {
            if (this.__openViewReferences.length) {
                var views = this.__openViewReferences.length;
                var referenceCount = this.__openViewReferences.reduce((c, r) => c + r.referenceCount, 0);
                window.console.warn('Some views were not or are not yet disposed (' + views + ' views, ' + referenceCount + ' references).');
            }
        }
    };

    ServerSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, {
        get 'size'() { return this.size; },

        'dispose': ServerSideDataSource.prototype.dispose,
        'openView': ServerSideDataSource.prototype.openView,
        'streamValues': ServerSideDataSource.prototype.streamValues
    }, ServerSideDataSource.prototype);

    /**
     * @constructor
     * @template V, O
     * @extends {de.benshu.ko.dataSource.View<V, O>}
     *
     * @param {ServerSideDataSource} dataSource
     * @param query
     * @param disposer
     */
    function ServerSideView(dataSource, query, disposer) {
        var requestPending = ko.observable(false);
        var metadata = ko.observable({'unfilteredSize': dataSource.size.peek(), 'filteredSize': 0});

        var previousValues = lists.newArrayList();
        var receivedValues = ko.observable();

        var computer = ko.pureComputed(() => {
            if (requestPending.peek())
                return requestPending();

            requestPending(true);

            var q = query.unwrapArguments().normalize();

            window.setTimeout(() => {
                if (!q.equals(query.unwrapArguments().normalize()))
                    return requestPending(false);

                dataSource.__querier['issue'](q)
                    .then(r => {
                        var newlyReceivedValues = [];
                        r['values'].reduce((_, v) => newlyReceivedValues.push(v));
                        receivedValues(newlyReceivedValues);

                        delete r['values'];
                        dataSource.__size(r['unfilteredSize']);
                        metadata(r);
                    })
                    .then(() => requestPending(false), () => requestPending(false));
            }); // TODO maybe the user wants to specify a delay > 0 ?
        });

        var values = ko.pureComputed(() => {
            computer(); // wake up the computer

            var newValues = receivedValues();
            var result = lists.newArrayList(newValues);

            if (observablesList) {
                observablesList = result.map(v => {
                    dataSource.__addValueReference(v);
                    return dataSource.__observableEntries.addReference(v);
                });

                previousValues.forEach(v => {
                    dataSource.__releaseValueReference(v);
                    dataSource.__observableEntries.releaseReference(v);
                });
            } else {
                result.forEach(dataSource.__addValueReference.bind(dataSource));
                previousValues.forEach(dataSource.__releaseValueReference.bind(dataSource));
            }

            previousValues = result;

            return result;
        });
        this.__values = values;

        var observablesList = null;
        this.__observables = ko.pureComputed(() => {
            values(); // the values computation updates the observablesList

            if (!observablesList)
                observablesList = previousValues.map(dataSource.__observableEntries.addReference);

            return observablesList;
        });
        this.__observables.subscribe(() => observablesList = null, null, 'asleep');

        this.__dirty = ko.pureComputed(() => requestPending());

        this.__metadata = ko.pureComputed(() => metadata());
        this.__filteredSize = ko.pureComputed(() => metadata()['filteredSize']);
        this.__size = ko.pureComputed(() => values().size());

        this.__dispose = () => {
            computer.dispose();
            disposer();
        };
    }

    ServerSideView.prototype = {
        get dirty() { return this.__dirty; },
        get filteredSize() { return this.__filteredSize; },
        get metadata() { return this.__metadata;},
        get observables() { return this.__observables;},
        get size() { return this.__size; },
        get values() { return this.__values;},

        dispose: function () { this.__dispose(); }
    };

    ServerSideView.prototype = js.objects.extend({}, {
        get 'dirty'() { return this.dirty; },
        get 'filteredSize'() { return this.filteredSize; },
        get 'metadata'() { return this.metadata; },
        get 'observables'() { return this.observables; },
        get 'size'() { return this.size; },
        get 'values'() { return this.values; },

        'dispose': ServerSideView.prototype.dispose
    }, ServerSideView.prototype);

    return ServerSideDataSource;
})
;
