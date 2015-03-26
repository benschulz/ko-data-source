/*
 * Copyright (c) 2015, Ben Schulz
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 */
define(['indexed-list', 'onefold-lists', 'onefold-js', 'knockout'],    function(indexed_list, onefold_lists, onefold_js, knockout) {
var ko_data_source_client_side_data_source_delta, ko_data_source_client_side_data_source_views_subviews, ko_data_source_client_side_data_source_views_abstract_view, ko_data_source_client_side_data_source_views_root_view, ko_data_source_client_side_data_source_views_filtered_view, ko_data_source_client_side_data_source_views_sorted_view, ko_data_source_client_side_data_source_views_clipped_view, ko_data_source_client_side_data_source_views_views, ko_data_source_streams_mapped_stream, ko_data_source_abstract_data_source, ko_data_source_streams_list_stream, ko_data_source_queries_query, ko_data_source_queries_limitable_query_configurator, ko_data_source_queries_offsettable_query_configurator, ko_data_source_queries_sortable_query_configurator, ko_data_source_queries_filterable_query_configurator, ko_data_source_queries_query_configurator, ko_data_source_client_side_data_source_client_side_data_source, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries, ko_data_source_ko_data_source, ko_data_source;

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
    this._observables = null;
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
      if (!this._observables)
        this._observables = ko.observable(this._indexedValues.map(this._observableEntries.addReference));
      return this._observables;
    },
    _synchronizeObservables: function (delta) {
      this._values.valueHasMutated();
      if (this._observables) {
        delta.added.forEach(this._observableEntries.addReference);
        this._observables(this._indexedValues.map(this._observableEntries.lookup));
        delta.removed.forEach(this._observableEntries.releaseReference);
      }
    },
    _releaseObservableReferences: function () {
      if (this._observables)
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
  // TODO this actually duplicates some tiny parts of AbstractView... consolidate somehow? (the prototypes are interesting too, perhaps more so)
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
  ClippedView.prototype = js.functions.identity({
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
  });
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
   * @extends Stream<I>
   *
   * @param {!Stream<D>} sourceStream
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
   * @extends {DataSource<I, V, O>}
   *
   * @param {!ObservableEntries<I, V, O>} observableEntries
   * @param {!function(I):V} getValueById
   */
  function AbstractDataSource(observableEntries, getValueById) {
    this.__getValueById = getValueById;
    this.__observableEntries = observableEntries;
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
  var proto = AbstractDataSource.prototype;
  js.objects.extend(proto, {
    'openEntryView': proto.openEntryView,
    'openOptionalEntryView': proto.openOptionalEntryView,
    'streamObservables': proto.streamObservables
  });
  /**
   * @constructor
   * @template V, O
   * @extends {EntryView<V, O>}
   *
   * @param {OptionalEntryView<V, O>} optionalEntryView
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
  /**
   * @constructor
   * @template I, V, O
   * @extends {OptionalEntryView<V, O>}
   *
   * @param {ObservableEntries<I, V, O>} observableEntries
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
      var sharedObservable = this.__observableEntries.addOptionalReference(this.value());
      this.__observable = sharedObservable();
      this.__optionalObservable = ko.observable({
        present: true,
        observable: this.observable()
      });
      this.__subscription = sharedObservable.subscribe(function () {
        this.__optionalObservable({
          present: false,
          observable: this.observable()
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
  return AbstractDataSource;
}(knockout, onefold_js, ko_data_source_streams_mapped_stream);

ko_data_source_streams_list_stream = function (js, MappedStream) {
  /**
   * @constructor
   * @template T
   * @extends Stream<T>
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

ko_data_source_queries_query = function () {
  function Query(predicate, comparator, offset, limit) {
    this._predicate = predicate;
    this._comparator = comparator;
    this._offset = offset;
    this._limit = limit;
  }
  return Query;
}();

ko_data_source_queries_limitable_query_configurator = function (js, Query) {
  function LimitableQueryConfigurator(predicate, comparator, offset) {
    Query.call(this, predicate, comparator, offset);
  }
  var proto = {
    limitedTo: function (limit) {
      return new Query(this._predicate, this._comparator, this._offset, limit);
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
      return new LimitableQueryConfigurator(this._predicate, this._comparator, offset);
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
      return new OffsettableQueryConfigurator(this._predicate, comparator);
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
    AbstractDataSource = ko_data_source_abstract_data_source, Delta = ko_data_source_client_side_data_source_delta, IndexedList = indexed_list, ListStream = ko_data_source_streams_list_stream, QueryConfigurator = ko_data_source_queries_query_configurator;
  /**
   * @constructor
   * @template I, V, O
   * @extends {DataSource<I, V, O>}
   */
  function ClientSideDataSource(idSelector, observableEntries) {
    var values = new IndexedList(idSelector);
    AbstractDataSource.call(this, observableEntries, function (entryId) {
      return values.getById(entryId);
    });
    this.__idSelector = idSelector;
    this.__observableEntries = observableEntries;
    this.__values = values;
    this.__deltas = ko.observable(new Delta());
    this.__openViewReferences = [];
    this.__addOpenViewReference(new OpenViewKey(), new views.RootView(this.__idSelector, this.__observableEntries, this.__values, this.__deltas));
  }
  ClientSideDataSource.prototype = {
    __addOpenViewReference: function (key, view) {
      var ref = new OpenViewReference(key, view, function () {
        return this.__openViewReferences.splice(this.__openViewReferences.indexOf(ref), 1);
      }.bind(this));
      this.__openViewReferences.push(ref);
      return ref;
    },
    __increaseReferenceCountOrOpenNewView: function (key) {
      var existing = js.arrays.singleOrNull(this.__openViewReferences, function (v) {
        return key.equals(v.key);
      });
      if (existing) {
        ++existing.referenceCount;
        return existing;
      } else {
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
    },
    addOrUpdateEntries: function (entries) {
      var added = [], updated = [];
      entries.forEach(function (entry) {
        return (this.__values.contains(entry) ? updated : added).push();
      }.bind(this));
      new Delta(added, updated).propagateTo(this.__deltas);
    },
    openView: function (queryConfiguration) {
      var query = (queryConfiguration || function (x) {
        return x;
      })(new QueryConfigurator());
      var key = OpenViewKey.fromQuery(query);
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
    },
    replaceEntries: function (newEntries) {
      var removedEntries = this.__values.toArray();
      this.__values.clear();
      this.__values.addAll(newEntries);
      new Delta(newEntries, [], removedEntries).propagateTo(this.__deltas);
      // TODO update only those that were already there before the delta was propagated
      this.__observableEntries.updateEntries(newEntries);
    },
    streamValues: function (queryConfiguration) {
      var view = this.openView(queryConfiguration);
      try {
        /** @type {?} */
        var untypedValues = view.values;
        /** @type {function():onefold.lists.List<?>} */
        var values = untypedValues;
        return Promise.resolve(new ListStream(values().slice()));
      } finally {
        view.dispose();
      }
    },
    updateEntries: function (updatedEntries) {
      this.__values.updateAll(updatedEntries);
      new Delta([], updatedEntries).propagateTo(this.__deltas);
      this.__observableEntries.updateEntries(updatedEntries);
    }  // TODO implement dispose
  };
  ClientSideDataSource.prototype = js.objects.extend({}, AbstractDataSource.prototype, ClientSideDataSource.prototype, {
    'addEntries': ClientSideDataSource.prototype.addEntries,
    'dispose': ClientSideDataSource.prototype.dispose,
    'addOrUpdateEntries': ClientSideDataSource.prototype.addOrUpdateEntries,
    'openView': ClientSideDataSource.prototype.openView,
    'removeEntries': ClientSideDataSource.prototype.removeEntries,
    'replaceEntries': ClientSideDataSource.prototype.replaceEntries,
    'streamValues': ClientSideDataSource.prototype.streamValues,
    'updateEntries': ClientSideDataSource.prototype.updateEntries
  });
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
    this.rank = Math.max(this.predicate === TRUE ? 0 : 1, this.comparator === ZERO ? 0 : 2, this.offset === 0 && this.limit === Number.POSITIVE_INFINITY ? 0 : 3);
  }
  OpenViewKey.fromQuery = function (query) {
    return new OpenViewKey(query._predicate, query._comparator, query._offset, query._limit);
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
    },
    releaseReference: function () {
      if (--this.referenceCount === 0) {
        this.disposer();
      }
    }
  };
  /**
   * @constructor
   * @template V, O
   * @extends {View<V, O>}
   *
   * @param internalView
   * @param internalViewRefs
   */
  function InternalViewAdapter(internalView, internalViewRefs) {
    this.__internalView = internalView;
    this.__internalViewRefs = internalViewRefs;
  }
  InternalViewAdapter.prototype = {
    get values() {
      return this.__internalView.values;
    },
    get observables() {
      return this.__internalView.observables;
    },
    dispose: function () {
      this.__internalViewRefs.forEach(function (r) {
        r.releaseReference();
      });
    }
  };
  InternalViewAdapter.prototype = js.objects.extend({
    get 'values'() {
      return this.values;
    },
    get 'observables'() {
      return this.observables;
    },
    'dispose': InternalViewAdapter.prototype.dispose
  }, InternalViewAdapter.prototype);
  return ClientSideDataSource;
}({});

ko_data_source_default_observable_state_transitioner = function (ko) {
  return function DefaultObservableStateTransitioner() {
    var isNonObservableProperty = {};
    Array.prototype.slice.call(arguments).forEach(function (property) {
      isNonObservableProperty[property] = true;
    });
    this.constructor = function (entry) {
      var observable = {};
      Object.keys(entry).forEach(function (p) {
        if (isNonObservableProperty[p])
          observable[p] = entry[p];
        else
          observable[p] = ko.observable(entry[p]);
      });
      return observable;
    };
    this.updater = function (observable, updatedEntry) {
      Object.keys(updatedEntry).filter(function (p) {
        return !isNonObservableProperty[p];
      }).forEach(function (p) {
        observable[p](updatedEntry[p]);
      });
      return observable;
    };
    this.destructor = function () {
    };
  };
}(knockout);

ko_data_source_observable_entries = function (ko) {
  /** @constructor */
  function ObservableEntry(observable) {
    this.observable = observable;
    this.optionalObservable = ko.observable(observable);
    this.refcount = 1;
  }
  // TODO reduce interface to minimum (addReference, addOptionalReference, releaseReference, updateEntries, dispose, ...?)
  return function ObservableEntries(idSelector, observableStateTransitioner) {
    observableStateTransitioner = observableStateTransitioner || {
      constructor: function (entry) {
        var observable = {};
        Object.keys(entry).forEach(function (k) {
          observable[k] = ko.observable(entry[k]);
        });
        return observable;
      },
      updater: function (observable, updatedEntry) {
        Object.keys(updatedEntry).forEach(function (k) {
          observable[k](updatedEntry[k]);
        });
        return observable;
      },
      destructor: function () {
      }
    };
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
      var entry = new ObservableEntry(observableStateTransitioner.constructor(value));
      hashtable[id] = entry;
      return entry;
    };
    this.releaseReference = function (value) {
      var id = idSelector(value);
      var entry = lookupEntry(id);
      if (--entry.refcount === 0) {
        observableStateTransitioner.destructor(entry.observable);
        delete hashtable[id];
      }
    };
    this.forcefullyReleaseRemainingReferencesById = function (id) {
      var entry = lookupEntry(id);
      entry.optionalObservable(null);
      observableStateTransitioner.destructor(entry.observable);
      delete hashtable[id];
    };
    this.lookup = function (value) {
      return lookupEntry(idSelector(value)).observable;
    };
    this.withById = function (id, action) {
      return action(lookupEntry(id).observable);
    };
    this.with = function (value, action) {
      return this.withById(idSelector(value), action);
    }.bind(this);
    this.withPresentById = function (id, action) {
      var entry = tryLookupEntry(id);
      if (entry)
        action(entry.observable);
    };
    this.withPresent = function (value, action) {
      return this.withPresentById(idSelector(value), action);
    }.bind(this);
    this.updateEntries = function (updatedEntries) {
      updatedEntries.forEach(function (updatedEntry) {
        this.withPresent(updatedEntry, function (observable) {
          observableStateTransitioner.updater(observable, updatedEntry);
        });
      }.bind(this));
    }.bind(this);
    this.dispose = function () {
      Object.keys(hashtable).forEach(this.forcefullyReleaseRemainingReferencesById);
    }.bind(this);
    var tryLookupEntry = function (id) {
      if (typeof id !== 'string')
        throw newInvalidIdTypeError(id);
      if (!Object.prototype.hasOwnProperty.call(hashtable, id))
        return null;
      return hashtable[id];
    };
    var lookupEntry = function (id) {
      var entry = tryLookupEntry(id);
      if (!entry)
        throw new Error('Es existierte keine Referenz zum Objekt mit Id \'' + id + '\' oder es wurden bereits alle freigegeben.');
      return entry;
    };
  };
}(knockout);

ko_data_source_ko_data_source = function (ClientSideDataSource, DefaultObservableStateTransitioner, ObservableEntries) {
  return {
    // TODO ServerSideDataSource: extend (and partially reduce?) DataSource interface to make room
    'ClientSideDataSource': ClientSideDataSource,
    'DefaultObservableStateTransitioner': DefaultObservableStateTransitioner,
    'ObservableEntries': ObservableEntries
  };
}(ko_data_source_client_side_data_source_client_side_data_source, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries);
ko_data_source = function (main) {
  return main;
}(ko_data_source_ko_data_source);return ko_data_source;
});