/*
 * Copyright (c) 2015, Ben Schulz
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 */
define(['indexed-list', 'stringifyable', 'onefold-lists', 'onefold-js', 'knockout'],    function(indexed_list, stringifyable, onefold_lists, onefold_js, knockout) {
var ko_data_source_client_side_data_source_delta, ko_data_source_client_side_data_source_views_subviews, ko_data_source_client_side_data_source_views_abstract_view, ko_data_source_client_side_data_source_views_root_view, ko_data_source_client_side_data_source_views_filtered_view, ko_data_source_client_side_data_source_views_sorted_view, ko_data_source_client_side_data_source_views_clipped_view, ko_data_source_client_side_data_source_views_views, ko_data_source_streams_mapped_stream, ko_data_source_abstract_data_source, ko_data_source_streams_list_stream, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries, ko_data_source_queries_query, ko_data_source_queries_limitable_query_configurator, ko_data_source_queries_offsettable_query_configurator, ko_data_source_queries_sortable_query_configurator, ko_data_source_queries_filterable_query_configurator, ko_data_source_queries_query_configurator, ko_data_source_client_side_data_source_client_side_data_source, ko_data_source_server_side_data_source_server_side_data_source, ko_data_source_streams_streams, ko_data_source_ko_data_source, ko_data_source;

ko_data_source_client_side_data_source_delta = function () {
  function Delta(added, updated, removed) {
    this.added = added || [];
    this.updated = updated || [];
    this.removed = removed || [];
  }
  Delta.prototype = {
    get size() {
      return this.added.length + this.updated.length + this.removed.length;
    },
    get empty() {
      return !this.size;
    },
    propagateTo: function (deltas) {
      if (!this.empty)
        deltas(this);
    }
  };
  return Delta;
}();

ko_data_source_client_side_data_source_views_subviews = {};

ko_data_source_client_side_data_source_views_abstract_view = function (ko, js, IndexedList, Delta, subviews) {
  function AbstractView(parent, indexedValues, deltas) {
    this._parent = parent;
    this._indexedValues = indexedValues || new IndexedList(parent._idSelector);
    this._deltas = deltas || ko.observable(new Delta());
    this._values = ko.observable(this._indexedValues.readOnly());
    this.__observablesList = null;
    this.__observables = ko.pureComputed(function () {
      this._values();
      if (!this.__observablesList)
        this.__observablesList = this._indexedValues.map(this._observableEntries.addReference);
      return this.__observablesList;
    }.bind(this));
    this.__observables.subscribe(function () {
      return this.__observablesList = null;
    }.bind(this), null, 'asleep');
  }
  AbstractView.prototype = {
    get _idSelector() {
      return this._parent._idSelector;
    },
    get _observableEntries() {
      return this._parent._observableEntries;
    },
    get values() {
      return this._values;
    },
    get observables() {
      return this.__observables;
    },
    _synchronizeObservables: function (delta) {
      if (this.__observablesList) {
        delta.added.forEach(this._observableEntries.addReference);
        this.__observablesList = this._indexedValues.map(this._observableEntries.lookup);
        delta.removed.forEach(this._observableEntries.releaseReference);
      }
      this._values.valueHasMutated();
    },
    _releaseObservableReferences: function () {
      if (this.__observables)
        this._indexedValues.forEach(this._observableEntries.releaseReference);
    },
    forceUpdateIfNecessary: function () {
      this._parent.forceUpdateIfNecessary();
      this._forceUpdateIfNecessary();
    },
    filteredBy: function (predicate) {
      return new subviews.FilteredView(this, predicate);
    },
    sortedBy: function (comparator) {
      return new subviews.SortedView(this, comparator);
    },
    clipped: function (offset, size) {
      return new subviews.ClippedView(this, offset, size);
    }
  };
  return AbstractView;
}(knockout, onefold_js, indexed_list, ko_data_source_client_side_data_source_delta, ko_data_source_client_side_data_source_views_subviews);

ko_data_source_client_side_data_source_views_root_view = function (ko, js, AbstractView) {
  function RootView(idSelector, observableEntries, values, deltas) {
    AbstractView.call(this, {
      _idSelector: idSelector,
      _observableEntries: observableEntries
    }, values, deltas);
    this.__deltaSubscription = deltas.subscribe(function (delta) {
      this._synchronizeObservables(delta);
    }.bind(this));
  }
  RootView.prototype = js.objects.extend({}, AbstractView.prototype, {
    forceUpdateIfNecessary: function () {
    },
    dispose: function () {
      this.__deltaSubscription.dispose();
      this._releaseObservableReferences();
    }
  });
  return RootView;
}(knockout, onefold_js, ko_data_source_client_side_data_source_views_abstract_view);

ko_data_source_client_side_data_source_views_filtered_view = function (ko, js, Delta, AbstractView, subviews) {
  function filterDelta(idSelector, indexedValues, delta, predicate) {
    var added = delta.added.filter(predicate);
    var updated = [];
    var deleted = delta.removed.filter(predicate);
    for (var i = 0, j = delta.updated.length; i < j; i++) {
      var entry = delta.updated[i];
      var contained = indexedValues.containsById(idSelector(entry));
      if (predicate(entry))
        if (contained)
          updated.push(entry);
        else
          added.push(entry);
      else if (contained)
        deleted.push(entry);
    }
    return new Delta(added, updated, deleted);
  }
  function FilteredView(parent, predicate) {
    AbstractView.call(this, parent);
    var privateRecomputeTrigger = ko.observable(ko.unwrap(predicate));
    this._forceUpdateIfNecessary = function () {
      return privateRecomputeTrigger(ko.unwrap(predicate));
    };
    this.__computer = ko.computed(function () {
      privateRecomputeTrigger();
      var p = ko.unwrap(predicate);
      privateRecomputeTrigger(p);
      var oldValues = this._indexedValues.toArray();
      var newValues = this._parent._indexedValues.filter(p).toArray();
      var delta = new Delta(newValues, [], oldValues);
      this._indexedValues.clear();
      this._indexedValues.addAll(newValues);
      this._synchronizeObservables(delta);
      delta.propagateTo(this._deltas);
    }.bind(this));
    this.__deltaSubscription = parent._deltas.subscribe(function (delta) {
      var filtered = filterDelta(this._idSelector, this._indexedValues, delta, ko.unwrap(predicate));
      if (filtered.empty)
        return;
      this._indexedValues.removeAll(filtered.removed);
      this._indexedValues.updateAll(filtered.updated);
      this._indexedValues.addAll(filtered.added);
      this._synchronizeObservables(delta);
      filtered.propagateTo(this._deltas);
    }.bind(this));
  }
  FilteredView.prototype = js.objects.extend({}, AbstractView.prototype, {
    dispose: function () {
      this.__computer.dispose();
      this.__deltaSubscription.dispose();
      this._releaseObservableReferences();
    }
  });
  subviews.FilteredView = FilteredView;
  return FilteredView;
}(knockout, onefold_js, ko_data_source_client_side_data_source_delta, ko_data_source_client_side_data_source_views_abstract_view, ko_data_source_client_side_data_source_views_subviews);

ko_data_source_client_side_data_source_views_sorted_view = function (ko, js, AbstractView, subviews) {
  function SortedView(parent, comparator) {
    AbstractView.call(this, parent);
    this._indexedValues.addAll(parent._indexedValues.toArray());
    var privateRecomputeTrigger = ko.observable(ko.unwrap(comparator));
    this._forceUpdateIfNecessary = function () {
      return privateRecomputeTrigger(ko.unwrap(comparator));
    };
    this.__computer = ko.computed(function () {
      privateRecomputeTrigger();
      var c = ko.unwrap(comparator);
      privateRecomputeTrigger(c);
      if (this._indexedValues.sortBy(c))
        this._deltas.valueHasMutated();
    }.bind(this));
    this.__deltaSubscription = parent._deltas.subscribe(function (delta) {
      var failedUpdates = this._indexedValues.tryUpdateAll(delta.updated);
      this._indexedValues.removeAll(delta.removed.concat(failedUpdates));
      this._indexedValues.insertAll(delta.added.concat(failedUpdates));
      this._synchronizeObservables(delta);
      this._deltas.valueHasMutated();
    }.bind(this));
  }
  SortedView.prototype = js.objects.extend({}, AbstractView.prototype, {
    filteredBy: function () {
      throw new Error('Filtering a sorted view is not supported.');
    },
    sortedBy: function () {
      throw new Error('Sorting a sorted view is not supported.');
    },
    dispose: function () {
      this.__computer.dispose();
      this.__deltaSubscription.dispose();
      this._releaseObservableReferences();
    }
  });
  subviews.SortedView = SortedView;
  return SortedView;
}(knockout, onefold_js, ko_data_source_client_side_data_source_views_abstract_view, ko_data_source_client_side_data_source_views_subviews);

ko_data_source_client_side_data_source_views_clipped_view = function (ko, js, lists, subviews) {
  function checkForChanges(idSelector, oldValues, newValues) {
    if (oldValues.length !== newValues.length)
      return true;
    for (var i = oldValues.length - 1; i >= 0; --i) {
      if (idSelector(oldValues.get(i)) !== idSelector(newValues.get(i)))
        return true;
    }
    return false;
  }
  // TODO rename AbstractView AbstractIndexedView and extract an AbstractView from it to inherit from
  function ClippedView(parent, offset, limit) {
    var observableEntries = parent._observableEntries;
    this.__parent = parent;
    this.__values = ko.observable(lists.newArrayList());
    this.__observables = null;
    var idSelector = parent._idSelector;
    var unwrapArguments = function () {
      return {
        offset: ko.unwrap(offset),
        limit: ko.unwrap(limit)
      };
    };
    var privateRecomputeTrigger = ko.observable(unwrapArguments());
    this._forceUpdateIfNecessary = function () {
      var lastArguments = privateRecomputeTrigger();
      var newArguments = unwrapArguments();
      if (lastArguments.offset !== newArguments.offset || lastArguments.limit !== newArguments.limit)
        privateRecomputeTrigger(newArguments);
    };
    this.__computer = ko.computed(function () {
      // the delta isn't worth much to clipping, so we reuse the __computer
      parent._deltas();
      privateRecomputeTrigger();
      var args = unwrapArguments();
      privateRecomputeTrigger(args);
      var unclipped = parent._indexedValues;
      var from = Math.min(unclipped.length, args.offset);
      var to = Math.min(unclipped.length, from + args.limit);
      var oldValues = this.__values.peek();
      var newValues = unclipped.slice(from, to);
      if (checkForChanges(idSelector, oldValues, newValues)) {
        this.__values(newValues);
        if (this.__observables) {
          this.__observables(this.__values.peek().map(observableEntries.addReference));
          oldValues.forEach(observableEntries.releaseReference);
        }
      }
    }.bind(this));
  }
  ClippedView.prototype = {
    get values() {
      return this.__values;
    },
    get observables() {
      if (!this.__observables)
        this.__observables = ko.observable(this.values().map(this.__parent._observableEntries.addReference));
      return this.__observables;
    },
    forceUpdateIfNecessary: function () {
      this.__parent.forceUpdateIfNecessary();
      this._forceUpdateIfNecessary();
    },
    filteredBy: function () {
      throw new Error('Filtering a clipped view is not supported.');
    },
    sortedBy: function () {
      throw new Error('Sorting a clipped view is not supported.');
    },
    clipped: function () {
      throw new Error('Clipping a clipped view is not supported.');
    },
    dispose: function () {
      this.__computer.dispose();
      if (this.__observables)
        this.__values().forEach(this.__parent._observableEntries.releaseReference);
    }
  };
  subviews.ClippedView = ClippedView;
  return ClippedView;
}(knockout, onefold_js, onefold_lists, ko_data_source_client_side_data_source_views_subviews);

ko_data_source_client_side_data_source_views_views = function (RootView) {
  return { RootView: RootView };
}(ko_data_source_client_side_data_source_views_root_view);

ko_data_source_streams_mapped_stream = function (js) {
  /**
   * @constructor
   * @template D, I
   * @extends {de.benshu.ko.dataSource.streams.Stream<I>}
   *
   * @param {!de.benshu.ko.dataSource.streams.Stream<D>} sourceStream
   * @param {function(D):I} mapper
   * @param {function(I)=} closer
   */
  function MappedStream(sourceStream, mapper, closer) {
    this.__sourceStream = sourceStream;
    this.__evaluator = closer ? function (action, sourceElement) {
      var resource = mapper(sourceElement);
      try {
        return action(resource);
      } finally {
        closer(resource);
      }
    } : function (action, sourceElement) {
      return action(mapper(sourceElement));
    };
  }
  MappedStream.prototype = {
    forEach: function (action) {
      this.__sourceStream.forEach(this.__evaluator.bind(null, action));
    },
    map: function (mapper) {
      return new MappedStream(this, mapper);
    },
    reduce: function (accumulator, identity) {
      return this.__sourceStream.reduce(function (a, b) {
        return accumulator(a, this.__evaluator(function (x) {
          return x;
        }, b));
      }.bind(this), identity);
    }
  };
  var proto = MappedStream.prototype;
  js.objects.extend(proto, {
    'forEach': proto.forEach,
    'map': proto.map,
    'reduce': proto.reduce
  });
  return MappedStream;
}(onefold_js);

ko_data_source_abstract_data_source = function (ko, js, MappedResource) {
  /**
   * @constructor
   * @template I, V, O
   * @extends {de.benshu.ko.dataSource.DataSource<I, V, O>}
   *
   * @param {!de.benshu.ko.dataSource.ObservableEntries<I, V, O>} observableEntries
   * @param {!function(I):V} getValueById
   */
  function AbstractDataSource(observableEntries, getValueById) {
    this.__observableEntries = observableEntries;
    this.__getValueById = getValueById;
  }
  AbstractDataSource.prototype = {
    openEntryView: function (entryId) {
      return new DefaultEntryView(this.openOptionalEntryView(entryId));
    },
    openOptionalEntryView: function (entryId) {
      return new DefaultOptionalEntryView(this.__observableEntries, this.__getValueById, entryId);
    },
    streamObservables: function (queryConfiguration) {
      return this.streamValues(queryConfiguration).then(function (values) {
        return new MappedResource(values, this.__observableEntries.addReference.bind(this.__observableEntries), this.__observableEntries.releaseReference.bind(this.__observableEntries));
      }.bind(this));
    },
    openView: function () {
      throw new Error('`' + this.constructor + '` does not implement `openView`.');
    },
    streamValues: function () {
      throw new Error('`' + this.constructor + '` does not implement `streamValues`.');
    },
    dispose: function () {
      throw new Error('`' + this.constructor + '` does not implement `dispose`.');
    }
  };
  AbstractDataSource.prototype = js.objects.extend({}, {
    'openEntryView': AbstractDataSource.prototype.openEntryView,
    'openOptionalEntryView': AbstractDataSource.prototype.openOptionalEntryView,
    'streamObservables': AbstractDataSource.prototype.streamObservables
  }, AbstractDataSource.prototype);
  /**
   * @constructor
   * @template V, O
   * @extends {de.benshu.ko.dataSource.EntryView<V, O>}
   *
   * @param {de.benshu.ko.dataSource.OptionalEntryView<V, O>} optionalEntryView
   */
  function DefaultEntryView(optionalEntryView) {
    this.__optionalEntryView = optionalEntryView;
    this.__subscription = null;
  }
  DefaultEntryView.prototype = {
    get value() {
      return this.__optionalEntryView.value;
    },
    get observable() {
      if (!this.__subscription) {
        this.__subscription = this.__optionalEntryView.optionalObservable.subscribe(function () {
          throw new Error('Illegal state: A non-optional view for this entry is still open.');
        });
      }
      return this.__optionalEntryView.observable;
    },
    dispose: function () {
      if (this.__subscription)
        this.__subscription.dispose();
      this.__optionalEntryView.dispose();
    }
  };
  DefaultEntryView.prototype = js.objects.extend({}, {
    get 'value'() {
      return this.value;
    },
    get 'observable'() {
      return this.observable;
    },
    'dispose': DefaultEntryView.prototype.dispose
  }, DefaultEntryView.prototype);
  /**
   * @constructor
   * @template I, V, O
   * @extends {de.benshu.ko.dataSource.OptionalEntryView<V, O>}
   *
   * @param {de.benshu.ko.dataSource.ObservableEntries<I, V, O>} observableEntries
   * @param {function(V):I} getValueById
   * @param {I} entryId
   */
  function DefaultOptionalEntryView(observableEntries, getValueById, entryId) {
    this.__observableEntries = observableEntries;
    this.__getValueById = getValueById;
    this.__entryId = entryId;
    this.__disposed = false;
    this.__lastKnownValue = null;
    this.__observable = null;
    this.__optionalObservable = null;
    this.__subscription = null;
  }
  DefaultOptionalEntryView.prototype = {
    __assertNotDisposed: function () {
      if (this.__disposed)
        throw new Error('Illegal state: Entry view was already disposed.');
    },
    get value() {
      this.__assertNotDisposed();
      return this.__lastKnownValue = this.__getValueById(this.__entryId);
    },
    get observable() {
      this.__assertNotDisposed();
      return (this.__observable || this.optionalObservable) && this.__observable;
    },
    get optionalObservable() {
      this.__assertNotDisposed();
      if (this.__optionalObservable)
        return this.__optionalObservable;
      var sharedObservable = this.__observableEntries.addOptionalReference(this.value);
      this.__observable = sharedObservable();
      this.__optionalObservable = ko.observable({
        'present': true,
        'observable': this.__observable
      });
      this.__subscription = sharedObservable.subscribe(function (observable) {
        this.__optionalObservable({
          'present': !!observable,
          'observable': observable
        });
      }.bind(this));
      return this.__optionalObservable;
    },
    dispose: function () {
      this.__assertNotDisposed();
      this.__disposed = true;
      if (this.__subscription) {
        this.__subscription.dispose();
        this.__observableEntries.releaseReference(this.__lastKnownValue);
        this.__lastKnownValue = this.__observable = this.__optionalObservable = this.__subscription = null;
      }
    }
  };
  DefaultOptionalEntryView.prototype = js.objects.extend({}, {
    get 'value'() {
      return this.value;
    },
    get 'observable'() {
      return this.observable;
    },
    get 'optionalObservable'() {
      return this.optionalObservable;
    },
    'dispose': DefaultOptionalEntryView.prototype.dispose
  }, DefaultOptionalEntryView.prototype);
  var TRUE = function () {
    return true;
  };
  var ZERO = function () {
    return 0;
  };
  /**
   * @constructor
   * @template V
   *
   * @param {(function(V):boolean|ko.Subscribable<function(V):boolean>)=} predicate
   * @param {(function(V, V):number|ko.Subscribable<function(V, V):number>)=} comparator
   * @param {(number|ko.Subscribable<number>)=} offset
   * @param {(number|ko.Subscribable<number>)=} limit
   */
  function OpenViewKey(predicate, comparator, offset, limit) {
    this.predicate = predicate || TRUE;
    this.comparator = comparator || ZERO;
    this.offset = offset || 0;
    this.limit = limit || limit === 0 ? limit : Number.POSITIVE_INFINITY;
    this.rank = Math.max(this.predicate === TRUE ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_FILTERED, this.comparator === ZERO ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_SORTED, this.offset === 0 && this.limit === Number.POSITIVE_INFINITY ? OpenViewKey.RANK_ROOT : OpenViewKey.RANK_CLIPPED);
  }
  OpenViewKey.RANK_ROOT = 0;
  OpenViewKey.RANK_FILTERED = 1;
  OpenViewKey.RANK_SORTED = 2;
  OpenViewKey.RANK_CLIPPED = 3;
  OpenViewKey.fromQuery = function (query) {
    return new OpenViewKey(query.predicate, query.comparator, query.offset, query.limit);
  };
  OpenViewKey.prototype = {
    equals: function (other) {
      return this.rank === other.rank && this.predicate === other.predicate && this.comparator === other.comparator && this.offset === other.offset && this.limit === other.limit;
    },
    reduceRank: function () {
      if (this.rank <= 0)
        throw new Error('Unsupported operation.');
      var args = [
        null,
        this.predicate,
        this.comparator
      ].slice(0, this.rank);
      /** @type {function(new:OpenViewKey<V>)} */
      var ReducedRankKeyConstructor = OpenViewKey.bind.apply(OpenViewKey, args);
      return new ReducedRankKeyConstructor();
    },
    allRanks: function () {
      return this.rank === 0 ? [this] : this.reduceRank().allRanks().concat([this]);
    },
    applyPrimaryTransformation: function (view) {
      var accessor = [
        function (v) {
          return v.filteredBy;
        },
        function (v) {
          return v.sortedBy;
        },
        function (v) {
          return v.clipped;
        }
      ][this.rank - 1];
      var args = [
        [this.predicate],
        [this.comparator],
        [
          this.offset,
          this.limit
        ]
      ][this.rank - 1];
      return accessor(view).apply(view, args);
    }
  };
  /**
   * @constructor
   *
   * @param key
   * @param view
   * @param disposer
   */
  function OpenViewReference(key, view, disposer) {
    this.key = key;
    this.view = view;
    this.referenceCount = 1;
    this.disposer = disposer;
  }
  OpenViewReference.prototype = {
    addReference: function () {
      if (this.referenceCount <= 0)
        throw new Error('Assertion error: Reference count at `' + this.referenceCount + '`.');
      ++this.referenceCount;
      return this;
    },
    releaseReference: function () {
      if (--this.referenceCount === 0) {
        this.disposer();
      }
      return this;
    }
  };
  AbstractDataSource.OpenViewKey = OpenViewKey;
  AbstractDataSource.OpenViewReference = OpenViewReference;
  return AbstractDataSource;
}(knockout, onefold_js, ko_data_source_streams_mapped_stream);

ko_data_source_streams_list_stream = function (js, MappedStream) {
  /**
   * @constructor
   * @template T
   * @extends {de.benshu.ko.dataSource.streams.Stream<T>}
   */
  function ListStream(list) {
    this.__list = list;
  }
  ListStream.prototype = {
    forEach: function (action) {
      // TODO prevent blocking
      this.__list.forEach(action);
    },
    map: function (mapper) {
      return new MappedStream(this, mapper);
    },
    reduce: function (accumulator, identity) {
      // TODO prevent blocking
      return Promise.resolve(this.__list.reduce(accumulator, identity));
    }
  };
  var proto = ListStream.prototype;
  js.objects.extend(proto, {
    'forEach': proto.forEach,
    'map': proto.map,
    'reduce': proto.reduce
  });
  return ListStream;
}(onefold_js, ko_data_source_streams_mapped_stream);

ko_data_source_default_observable_state_transitioner = function (ko) {
  function DefaultObservableStateTransitioner(options) {
    this.__isObservableProperty = false;
    (options && options['observableProperties'] || []).forEach(function (p) {
      this.__isObservableProperty = this.__isObservableProperty || {};
      this.__isObservableProperty[p] = true;
    }.bind(this));
  }
  DefaultObservableStateTransitioner.prototype = {
    'constructor': function (entry) {
      var isObservableProperty = this.__isObservableProperty;
      if (!isObservableProperty)
        return entry;
      var observable = {};
      Object.keys(entry).forEach(function (p) {
        if (isObservableProperty && isObservableProperty[p])
          observable[p] = ko.observable(entry[p]);
        else
          observable[p] = entry[p];
      });
      return observable;
    },
    'updater': function (observable, updatedEntry) {
      var isObservableProperty = this.__isObservableProperty;
      if (!isObservableProperty)
        return observable;
      Object.keys(updatedEntry).filter(function (p) {
        return isObservableProperty && isObservableProperty[p];
      }).forEach(function (p) {
        return observable[p](updatedEntry[p]);
      });
      return observable;
    },
    'destructor': function () {
    }
  };
  return DefaultObservableStateTransitioner;
}(knockout);

ko_data_source_observable_entries = function (ko, js, DefaultObservableStateTransitioner) {
  /** @constructor */
  function ObservableEntry(observable) {
    this.observable = observable;
    this.optionalObservable = ko.observable(observable);
    this.refcount = 1;
  }
  // TODO clean up extract prototype
  return function ObservableEntries(idSelector, observableStateTransitioner) {
    observableStateTransitioner = observableStateTransitioner || new DefaultObservableStateTransitioner();
    var hashtable = {};
    var newInvalidIdTypeError = function (id) {
      throw new Error('Illegal argument: Ids must be strings (\'' + id + '\' is of type \'' + typeof id + '\').');
    };
    this.addReference = function (value) {
      return addAnyReference(value).observable;
    };
    this.addOptionalReference = function (value) {
      return addAnyReference(value).optionalObservable;
    };
    var addAnyReference = function (value) {
      var id = idSelector(value);
      if (typeof id !== 'string')
        throw newInvalidIdTypeError(id);
      return Object.prototype.hasOwnProperty.call(hashtable, id) ? addReferenceToExistingEntry(id) : addEntry(id, value);
    };
    var addReferenceToExistingEntry = function (id) {
      var entry = hashtable[id];
      ++entry.refcount;
      return entry;
    };
    var addEntry = function (id, value) {
      var entry = new ObservableEntry(observableStateTransitioner['constructor'](value));
      hashtable[id] = entry;
      return entry;
    };
    this.releaseReference = function (value) {
      var id = idSelector(value);
      var entry = lookupEntry(id);
      if (--entry.refcount === 0) {
        destroy(entry);
        delete hashtable[id];
      }
    };
    this.lookup = function (value) {
      return lookupEntry(idSelector(value)).observable;
    };
    this.reconstructEntries = function (addedEntries) {
      addedEntries.forEach(function (addedEntry) {
        var id = idSelector(addedEntry);
        if (js.objects.hasOwn(hashtable, id)) {
          var entry = hashtable[id];
          if (!entry.observable) {
            entry.observable = observableStateTransitioner['constructor'](addedEntry);
            entry.optionalObservable(entry.observable);
          }
        }
      });
    };
    this.updateEntries = function (updatedEntries) {
      updatedEntries.forEach(function (updatedEntry) {
        var id = idSelector(updatedEntry);
        if (js.objects.hasOwn(hashtable, id)) {
          var entry = hashtable[id];
          observableStateTransitioner['updater'](entry.observable, updatedEntry);
        }
      });
    };
    this.reconstructUpdateOrDestroyAll = function (updatedValueSupplier) {
      js.objects.forEachProperty(hashtable, function (id, entry) {
        var updatedValue = updatedValueSupplier(id);
        if (updatedValue) {
          if (entry.observable) {
            observableStateTransitioner['updater'](entry.observable, updatedValue);
          } else {
            entry.observable = observableStateTransitioner['constructor'](updatedValue);
            entry.optionalObservable(entry.observable);
          }
        } else {
          destroy(entry);
        }
      });
    };
    this.destroyAll = function (idPredicate) {
      js.objects.forEachProperty(hashtable, function (id, entry) {
        if (idPredicate(id))
          destroy(entry);
      });
    };
    function destroy(entry) {
      var observable = entry.observable;
      entry.optionalObservable(null);
      entry.observable = null;
      observableStateTransitioner['destructor'](observable);
    }
    this.dispose = function () {
      this.destroyAll(function () {
        return true;
      });
    }.bind(this);
    var lookupEntry = function (id) {
      if (typeof id !== 'string')
        throw newInvalidIdTypeError(id);
      if (js.objects.hasOwn(hashtable, id))
        return hashtable[id];
      else
        throw new Error('No entry for id `' + id + '`.');
    };
  };
}(knockout, onefold_js, ko_data_source_default_observable_state_transitioner);

ko_data_source_queries_query = function (ko, js, stringifyable) {
  /**
   * @constructor
   * @extends {de.benshu.ko.dataSource.Query}
   */
  function Query(predicate, comparator, offset, limit) {
    this.__predicate = predicate;
    this.__comparator = comparator;
    this.__offset = offset;
    this.__limit = limit;
  }
  Query.prototype = js.objects.extend({
    get 'predicate'() {
      return this.predicate;
    },
    get 'comparator'() {
      return this.comparator;
    },
    get 'offset'() {
      return this.offset;
    },
    get 'limit'() {
      return this.limit;
    }
  }, {
    get predicate() {
      return this.__predicate;
    },
    get comparator() {
      return this.__comparator;
    },
    get offset() {
      return this.__offset;
    },
    get limit() {
      return this.__limit;
    },
    normalize: function () {
      return new Query(this.predicate || stringifyable.predicates.alwaysTrue, this.comparator || stringifyable.comparators.indifferent, this.offset || 0, this.limit || this.limit === 0 ? this.limit : Number.POSITIVE_INFINITY);
    },
    unwrapArguments: function () {
      return new Query(ko.unwrap(this.predicate), ko.unwrap(this.comparator), ko.unwrap(this.offset), ko.unwrap(this.limit));
    },
    equals: function (other) {
      return this.predicate === other.predicate && this.comparator === other.comparator && this.offset === other.offset && this.limit === other.limit;
    }
  });
  return Query;
}(knockout, onefold_js, stringifyable);

ko_data_source_queries_limitable_query_configurator = function (js, Query) {
  function LimitableQueryConfigurator(predicate, comparator, offset) {
    Query.call(this, predicate, comparator, offset);
  }
  var proto = {
    limitedTo: function (limit) {
      return new Query(this.predicate, this.comparator, this.offset, limit);
    }
  };
  LimitableQueryConfigurator.prototype = js.objects.extend({}, Query.prototype, proto, { 'limitedTo': proto.limitedTo });
  return LimitableQueryConfigurator;
}(onefold_js, ko_data_source_queries_query);

ko_data_source_queries_offsettable_query_configurator = function (js, LimitableQueryConfigurator) {
  function OffsettableQueryConfigurator(predicate, comparator) {
    LimitableQueryConfigurator.call(this, predicate, comparator);
  }
  var proto = {
    offsetBy: function (offset) {
      return new LimitableQueryConfigurator(this.predicate, this.comparator, offset);
    }
  };
  OffsettableQueryConfigurator.prototype = js.objects.extend({}, LimitableQueryConfigurator.prototype, proto, { 'offsetBy': proto.offsetBy });
  return OffsettableQueryConfigurator;
}(onefold_js, ko_data_source_queries_limitable_query_configurator);

ko_data_source_queries_sortable_query_configurator = function (js, OffsettableQueryConfigurator) {
  function SortableQueryConfigurator(predicate) {
    OffsettableQueryConfigurator.call(this, predicate);
  }
  var proto = {
    sortedBy: function (comparator) {
      return new OffsettableQueryConfigurator(this.predicate, comparator);
    }
  };
  SortableQueryConfigurator.prototype = js.objects.extend({}, OffsettableQueryConfigurator.prototype, proto, { 'sortedBy': proto.sortedBy });
  return SortableQueryConfigurator;
}(onefold_js, ko_data_source_queries_offsettable_query_configurator);

ko_data_source_queries_filterable_query_configurator = function (js, SortableQueryConfigurator) {
  function FilterableQueryConfigurator() {
    SortableQueryConfigurator.call(this);
  }
  var proto = {
    filteredBy: function (predicate) {
      return new SortableQueryConfigurator(predicate);
    }
  };
  FilterableQueryConfigurator.prototype = js.objects.extend({}, SortableQueryConfigurator.prototype, proto, { 'filteredBy': proto.filteredBy });
  return FilterableQueryConfigurator;
}(onefold_js, ko_data_source_queries_sortable_query_configurator);

ko_data_source_queries_query_configurator = function (js, FilterableQueryConfigurator) {
  /**
   * @constructor
   */
  function QueryConfiguratorImpl() {
    FilterableQueryConfigurator.call(this);
  }
  QueryConfiguratorImpl.prototype = js.objects.extend({}, FilterableQueryConfigurator.prototype);
  return QueryConfiguratorImpl;
}(onefold_js, ko_data_source_queries_filterable_query_configurator);

ko_data_source_client_side_data_source_client_side_data_source = function (require) {
  var ko = knockout, js = onefold_js,
    //
    views = ko_data_source_client_side_data_source_views_views,
    //
    AbstractDataSource = ko_data_source_abstract_data_source, Delta = ko_data_source_client_side_data_source_delta, IndexedList = indexed_list, ListStream = ko_data_source_streams_list_stream, ObservableEntries = ko_data_source_observable_entries, QueryConfigurator = ko_data_source_queries_query_configurator;
  /**
   * @constructor
   * @template I, V, O
   * @extends {AbstractDataSource<I, V, O>}
   */
  function ClientSideDataSource(idSelector, observableEntries) {
    observableEntries = observableEntries || new ObservableEntries(idSelector);
    var values = new IndexedList(idSelector);
    AbstractDataSource.call(this, observableEntries, function (entryId) {
      return values.getById(entryId);
    });
    this.__idSelector = idSelector;
    this.__observableEntries = observableEntries;
    this.__values = values;
    this.__deltas = ko.observable(new Delta());
    this.__openViewReferences = [];
    var rootView = new views.RootView(this.__idSelector, this.__observableEntries, this.__values, this.__deltas);
    this.__rootView = this.__addOpenViewReference(new AbstractDataSource.OpenViewKey(), rootView);
    this.__size = ko.pureComputed(function () {
      return rootView.values().length;
    });
  }
  ClientSideDataSource.prototype = {
    get size() {
      return this.__size;
    },
    __addOpenViewReference: function (key, view) {
      var ref = new AbstractDataSource.OpenViewReference(key, view, function () {
        return this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1);
      }.bind(this));
      this.__openViewReferences.push(ref);
      return ref;
    },
    __increaseReferenceCountOrOpenNewView: function (key) {
      var existing = js.arrays.singleOrNull(this.__openViewReferences, function (v) {
        return key.equals(v.key);
      });
      if (existing)
        return existing.addReference();
      else {
        var parentKey = key.reduceRank();
        var parentView = js.arrays.single(this.__openViewReferences, function (v) {
          return parentKey.equals(v.key);
        }).view;
        var view = key.applyPrimaryTransformation(parentView);
        return this.__addOpenViewReference(key, view);
      }
    },
    addEntries: function (newEntries) {
      this.__values.addAll(newEntries);
      new Delta(newEntries).propagateTo(this.__deltas);
      this.__observableEntries.reconstructEntries(newEntries);
    },
    addOrUpdateEntries: function (entries) {
      var added = [], updated = [];
      entries.forEach(function (entry) {
        return (this.__values.contains(entry) ? updated : added).push(entry);
      }.bind(this));
      this.__values.addAll(added);
      this.__values.updateAll(updated);
      new Delta(added, updated).propagateTo(this.__deltas);
      this.__observableEntries.reconstructEntries(added);
      this.__observableEntries.updateEntries(updated);
    },
    openView: function (queryConfiguration) {
      var query = (queryConfiguration || function (x) {
        return x;
      })(new QueryConfigurator());
      var key = AbstractDataSource.OpenViewKey.fromQuery(query);
      var internalViewRefs = key.allRanks().map(function (k) {
        return this.__increaseReferenceCountOrOpenNewView(k);
      }.bind(this));
      var internalView = internalViewRefs[internalViewRefs.length - 1].view;
      internalView.forceUpdateIfNecessary();
      return new InternalViewAdapter(internalView, internalViewRefs);
    },
    removeEntries: function (entries) {
      this.__values.removeAll(entries);
      new Delta([], [], entries).propagateTo(this.__deltas);
      this.__observableEntries.destroyAll(function (id) {
        return !this.__values.containsById(id);
      }.bind(this));
    },
    replaceEntries: function (newEntries) {
      var removedEntries = this.__values.toArray();
      this.__values.clear();
      this.__values.addAll(newEntries);
      new Delta(newEntries, [], removedEntries).propagateTo(this.__deltas);
      this.__observableEntries.reconstructUpdateOrDestroyAll(function (id) {
        return this.__values.tryGetById(id);
      }.bind(this));
    },
    streamValues: function (queryConfiguration) {
      var view = this.openView(queryConfiguration);
      try {
        return Promise.resolve(new ListStream(view.values.peek().slice()));
      } finally {
        view.dispose();
      }
    },
    updateEntries: function (updatedEntries) {
      this.__values.updateAll(updatedEntries);
      new Delta([], updatedEntries).propagateTo(this.__deltas);
      this.__observableEntries.updateEntries(updatedEntries);
    },
    dispose: function () {
      this.__rootView.releaseReference();
      this.__observableEntries.dispose();
      if (this.__openViewReferences.length) {
        var views = this.__openViewReferences.length;
        var referenceCount = this.__openViewReferences.reduce(function (c, r) {
          return c + r.referenceCount;
        }, 0);
        window.console.warn('Some views were not or are not yet disposed (' + views + ' views, ' + referenceCount + ' references).');
      }
    }
  };
  ClientSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, {
    get 'size'() {
      return this.size;
    },
    'addEntries': ClientSideDataSource.prototype.addEntries,
    'dispose': ClientSideDataSource.prototype.dispose,
    'addOrUpdateEntries': ClientSideDataSource.prototype.addOrUpdateEntries,
    'openView': ClientSideDataSource.prototype.openView,
    'removeEntries': ClientSideDataSource.prototype.removeEntries,
    'replaceEntries': ClientSideDataSource.prototype.replaceEntries,
    'streamValues': ClientSideDataSource.prototype.streamValues,
    'updateEntries': ClientSideDataSource.prototype.updateEntries
  }, ClientSideDataSource.prototype);
  var NO_DIRTY = ko.pureComputed(function () {
    return false;
  });
  /**
   * @constructor
   * @template V, O
   * @extends {de.benshu.ko.dataSource.View<V, O>}
   *
   * @param internalView
   * @param internalViewRefs
   */
  function InternalViewAdapter(internalView, internalViewRefs) {
    this.__internalView = internalView;
    this.__internalViewRefs = internalViewRefs;
    this.__size = ko.pureComputed(function () {
      return internalView.values().length;
    });
    this.__filteredSize = ko.pureComputed(function () {
      var filteredRef = js.arrays.singleOrNull(internalViewRefs, function (r) {
        return r.key.rank === AbstractDataSource.OpenViewKey.RANK_FILTERED;
      }) || internalViewRefs[0];
      return filteredRef.view.values().length;
    });
  }
  InternalViewAdapter.prototype = {
    get dirty() {
      return NO_DIRTY;
    },
    get filteredSize() {
      return this.__filteredSize;
    },
    get metadata() {
      return ko.pureComputed(function () {
        return {};
      });
    },
    get observables() {
      return this.__internalView.observables;
    },
    get size() {
      return this.__size;
    },
    get values() {
      return this.__internalView.values;
    },
    dispose: function () {
      this.__internalViewRefs.forEach(function (r) {
        r.releaseReference();
      });
    }
  };
  InternalViewAdapter.prototype = js.objects.extend({
    get 'dirty'() {
      return this.dirty;
    },
    get 'filteredSize'() {
      return this.filteredSize;
    },
    get 'metadata'() {
      return this.metadata;
    },
    get 'observables'() {
      return this.observables;
    },
    get 'size'() {
      return this.size;
    },
    get 'values'() {
      return this.values;
    },
    'dispose': InternalViewAdapter.prototype.dispose
  }, InternalViewAdapter.prototype);
  return ClientSideDataSource;
}({});

ko_data_source_server_side_data_source_server_side_data_source = function (require) {
  var ko = knockout, js = onefold_js, lists = onefold_lists,
    //
    AbstractDataSource = ko_data_source_abstract_data_source, ObservableEntries = ko_data_source_observable_entries, QueryConfigurator = ko_data_source_queries_query_configurator;
  var hasOwn = js.objects.hasOwn;
  /**
   * @constructor
   * @template I, V, O
   * @extends {AbstractDataSource<I, V, O>}
   */
  function ServerSideDataSource(idSelector, querier, observableEntries) {
    observableEntries = observableEntries || new ObservableEntries(idSelector);
    var values = {};
    AbstractDataSource.call(this, observableEntries, function (entryId) {
      if (!hasOwn(values, entryId))
        throw new Error('No known entry with id `' + entryId + '`.');
      return values[entryId].value;
    });
    this.__idSelector = idSelector;
    this.__observableEntries = observableEntries;
    this.__querier = querier;
    this.__values = values;
    this.__size = ko.observable(0);
    this.__computedSize = ko.pureComputed(function () {
      return this.__size();
    }.bind(this));
    this.__openViewReferences = [];
  }
  ServerSideDataSource.prototype = {
    get size() {
      return this.__computedSize;
    },
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
      var query = (queryConfiguration || function (x) {
        return x;
      })(new QueryConfigurator());
      var key = AbstractDataSource.OpenViewKey.fromQuery(query);
      var existing = js.arrays.singleOrNull(this.__openViewReferences, function (v) {
        return key.equals(v.key);
      });
      if (existing)
        return existing.addReference().view;
      else {
        var view = new ServerSideView(this, query, function () {
          return ref.releaseReference();
        });
        var ref = new AbstractDataSource.OpenViewReference(key, view, function () {
          return this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1);
        }.bind(this));
        this.__openViewReferences.push(ref);
        return view;
      }
    },
    streamValues: function (queryConfiguration) {
      /** @type {?} */
      var query = (queryConfiguration || function (x) {
        return x;
      })(new QueryConfigurator());
      return this.__querier['issue'](query.unwrapArguments().normalize());
    },
    dispose: function () {
      this.__observableEntries.dispose();
      if (this.__openViewReferences.length) {
        var views = this.__openViewReferences.length;
        var referenceCount = this.__openViewReferences.reduce(function (c, r) {
          return c + r.referenceCount;
        }, 0);
        window.console.warn('Some views were not or are not yet disposed (' + views + ' views, ' + referenceCount + ' references).');
      }
    }
  };
  ServerSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, {
    get 'size'() {
      return this.size;
    },
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
    var dirty = ko.observable(false);
    var metadata = ko.observable({
      'unfilteredSize': dataSource.size.peek(),
      'filteredSize': 0
    });
    var previousValues = lists.newArrayList();
    var receivedValues = ko.observable();
    var cache = [];
    var cacheRangeFroms = [];
    var cacheRangeTos = [];
    var lastPredicate = null;
    var lastComparator = null;
    var computer = ko.pureComputed(function () {
      if (requestPending.peek())
        return requestPending();
      var q = query.unwrapArguments().normalize();
      if (isCached(q))
        return receivedValues(cache.slice(q.offset, q.offset + q.limit));
      dirty(true);
      requestPending(true);
      window.setTimeout(function () {
        if (!q.equals(query.unwrapArguments().normalize()))
          return requestPending(false);
        dataSource.__querier['issue'](q).then(function (r) {
          var newlyReceivedValues = [];
          r['values'].reduce(function (_, v) {
            return newlyReceivedValues.push(v);
          });
          receivedValues(newlyReceivedValues);
          delete r['values'];
          dataSource.__size(r['unfilteredSize']);
          metadata(r);
          cacheResult(q, newlyReceivedValues);
        }).then(function () {
          dirty(false);
          requestPending(false);
        }, function () {
          requestPending(false);
        });
      });  // TODO maybe the user wants to specify a delay > 0 ?
    });
    function isCached(q) {
      if (q.predicate !== lastPredicate || q.comparator !== lastComparator)
        return false;
      for (var i = 0, l = cacheRangeFroms.length; i < l; ++i) {
        var from = cacheRangeFroms[i], to = cacheRangeTos[i];
        if (from <= q.offset && to >= q.offset + q.limit)
          return true;
      }
      return false;
    }
    function cacheResult(q, result) {
      if (q.predicate !== lastPredicate || q.comparator !== lastComparator) {
        resetCache(q.predicate, q.comparator);
      }
      var from = q.offset, to = from + q.limit;
      var mergedFrom = from, mergedTo = to;
      var i, j, l;
      for (i = 0, j = 0, l = cacheRangeFroms.length; i < l; ++i) {
        var rangeFrom = cacheRangeFroms[j] = cacheRangeFroms[i], rangeTo = cacheRangeTos[j] = cacheRangeTos[i];
        if (mergedFrom <= rangeTo && mergedTo >= rangeFrom) {
          mergedFrom = Math.min(rangeFrom, mergedFrom);
          mergedTo = Math.max(rangeTo, mergedTo);
        } else
          ++j;
      }
      cacheRangeFroms.length = cacheRangeTos.length = j;
      cacheRangeFroms.push(mergedFrom);
      cacheRangeTos.push(mergedTo >= metadata()['filteredSize'] ? Number.POSITIVE_INFINITY : mergedTo);
      for (i = 0, l = result.length; i < l; ++i)
        cache[from + i] = result[i];
      window.console.log('Cache ranges:');
      for (i = 0, l = cacheRangeFroms.length; i < l; ++i)
        window.console.log('[' + cacheRangeFroms[i] + ', ' + cacheRangeTos[i] + ']');
    }
    function resetCache(predicate, comparator) {
      cache = [];
      cacheRangeFroms = [];
      cacheRangeTos = [];
      lastPredicate = predicate;
      lastComparator = comparator;
    }
    var values = ko.pureComputed(function () {
      computer();
      // wake up the computer
      var newValues = receivedValues();
      var result = lists.newArrayList(newValues);
      if (observablesList) {
        observablesList = result.map(function (v) {
          dataSource.__addValueReference(v);
          return dataSource.__observableEntries.addReference(v);
        });
        previousValues.forEach(function (v) {
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
    this.__observables = ko.pureComputed(function () {
      values();
      // the values computation updates the observablesList
      if (!observablesList)
        observablesList = previousValues.map(dataSource.__observableEntries.addReference);
      return observablesList;
    });
    this.__observables.subscribe(function () {
      return observablesList = null;
    }, null, 'asleep');
    this.__dirty = ko.pureComputed(function () {
      return dirty();
    });
    this.__metadata = ko.pureComputed(function () {
      return metadata();
    });
    this.__filteredSize = ko.pureComputed(function () {
      return metadata()['filteredSize'];
    });
    this.__size = ko.pureComputed(function () {
      return values().length;
    });
    this.__dispose = function () {
      computer.dispose();
      disposer();
    };
  }
  ServerSideView.prototype = {
    get dirty() {
      return this.__dirty;
    },
    get filteredSize() {
      return this.__filteredSize;
    },
    get metadata() {
      return this.__metadata;
    },
    get observables() {
      return this.__observables;
    },
    get size() {
      return this.__size;
    },
    get values() {
      return this.__values;
    },
    dispose: function () {
      this.__dispose();
    }
  };
  ServerSideView.prototype = js.objects.extend({}, {
    get 'dirty'() {
      return this.dirty;
    },
    get 'filteredSize'() {
      return this.filteredSize;
    },
    get 'metadata'() {
      return this.metadata;
    },
    get 'observables'() {
      return this.observables;
    },
    get 'size'() {
      return this.size;
    },
    get 'values'() {
      return this.values;
    },
    'dispose': ServerSideView.prototype.dispose
  }, ServerSideView.prototype);
  return ServerSideDataSource;
}({});

ko_data_source_streams_streams = function (lists, ListStream) {
  return {
    'streamArray': function (array) {
      return new ListStream(lists.newArrayList(array));
    }
  };
}(onefold_lists, ko_data_source_streams_list_stream);

ko_data_source_ko_data_source = function (ClientSideDataSource, DefaultObservableStateTransitioner, ObservableEntries, ServerSideDataSource, streams) {
  return {
    'ClientSideDataSource': ClientSideDataSource,
    'DefaultObservableStateTransitioner': DefaultObservableStateTransitioner,
    'ObservableEntries': ObservableEntries,
    'ServerSideDataSource': ServerSideDataSource,
    'streams': streams
  };
}(ko_data_source_client_side_data_source_client_side_data_source, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries, ko_data_source_server_side_data_source_server_side_data_source, ko_data_source_streams_streams);
ko_data_source = function (main) {
  return main;
}(ko_data_source_ko_data_source);return ko_data_source;
});