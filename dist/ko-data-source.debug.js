/**
 * @license Copyright (c) 2015, Ben Schulz
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 */
;(function(factory) {
    if (typeof define === 'function' && define['amd'])
        define(['knockout'], factory);
    else
        window['ko-data-source'] = factory(window.ko);
} (function(knockout) {
/**
 * Copyright (c) 2015, Ben Schulz
 * License: BSD 3-clause (http://opensource.org/licenses/BSD-3-Clause)
 */
var onefold_js, onefold_lists, indexed_list, ko_data_source_delta, ko_data_source_views_subviews, ko_data_source_views_abstract_view, ko_data_source_views_root_view, ko_data_source_views_filtered_view, ko_data_source_views_ordered_view, ko_data_source_views_clipped_view, ko_data_source_views_views, ko_data_source_client_side_data_source, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries, ko_data_source_ko_data_source, ko_data_source;
onefold_js = function () {
  var onefold_js_arrays, onefold_js_functions, onefold_js_objects, onefold_js_strings, onefold_js_internal, onefold_js;
  onefold_js_arrays = function () {
    function naturalComparator(a, b) {
      return a && typeof a.valueOf === 'function' && b && typeof b.valueOf === 'function' ? a.valueOf() <= b.valueOf() ? a.valueOf() < b.valueOf() ? -1 : 0 : 1 : a <= b ? a < b ? -1 : 0 : 1;
    }
    function stableSort(source, comparator, sortSource) {
      var isChrome = !!window['chrome'];
      var nativeSortIsStable = !isChrome;
      return nativeSortIsStable ? stableSortNative(source, comparator, sortSource) : stableSortCustom(source, comparator, sortSource);
    }
    function stableSortNative(source, comparator, sortSource) {
      var destination = sortSource === true ? source : source.slice();
      destination.sort(comparator);
      return destination;
    }
    function stableSortCustom(source, comparator, sortSource) {
      var length = source.length;
      var indexes = new Array(length);
      var destination = new Array(length);
      var i;
      // TODO performance benchark: would it be better copy source via .slice()?
      //      i would hope this does pretty much the same as .slice() but we give
      //      out-of-order execution the chance to absorb more cache misses until
      //      the prefetcher kicks in
      for (i = 0; i < length; ++i) {
        indexes[i] = i;
        destination[i] = source[i];
      }
      if (sortSource === true) {
        var tmp = source;
        source = destination;
        destination = tmp;
      }
      indexes.sort(function (a, b) {
        var byOrdering = comparator(source[a], source[b]);
        return byOrdering || a - b;
      });
      for (i = 0; i < length; ++i)
        destination[i] = source[indexes[i]];
      return destination;
    }
    return {
      contains: function (array, value) {
        return array.indexOf(value) >= 0;
      },
      flatMap: function (array, mapping) {
        return Array.prototype.concat.apply([], array.map(mapping));
      },
      stableSort: function (array, comparator) {
        return stableSort(array, comparator || naturalComparator, true);
      }
    };
  }();
  onefold_js_functions = function () {
    var constant = function (x) {
      return function () {
        return x;
      };
    };
    return {
      true: constant(true),
      false: constant(false),
      nop: constant(undefined),
      null: constant(null),
      zero: constant(0),
      constant: constant,
      identity: function (x) {
        return x;
      }
    };
  }();
  onefold_js_objects = function () {
    function hasOwn(owner, propertyName) {
      return Object.prototype.hasOwnProperty.call(owner, propertyName);
    }
    function forEachProperty(owner, action) {
      for (var propertyName in owner)
        if (hasOwn(owner, propertyName))
          action(propertyName, owner[propertyName]);
    }
    return {
      areEqual: function (a, b) {
        return a === b || !!(a && typeof a.valueOf === 'function' && b && typeof b.valueOf === 'function' && a.valueOf() === b.valueOf());
      },
      extend: function (target) {
        Array.prototype.slice.call(arguments, 1).forEach(function (source) {
          var keys = Object.keys(source);
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var descriptor = Object.getOwnPropertyDescriptor(source, key);
            if (descriptor !== undefined && descriptor.enumerable)
              Object.defineProperty(target, key, descriptor);
          }
        });
        return target;
      },
      forEachProperty: forEachProperty,
      hasOwn: hasOwn
    };
  }();
  onefold_js_strings = {
    convertCamelToHyphenCase: function (camelCased) {
      return camelCased.replace(/([A-Z])/g, function (match) {
        return '-' + match.toLowerCase();
      });
    },
    convertHyphenToCamelCase: function (hyphenCased) {
      return hyphenCased.replace(/-([a-z])/g, function (match) {
        return match[1].toUpperCase();
      });
    },
    format: function (formatString) {
      var args = arguments;
      return formatString.replace(/{(\d+)}/g, function (match, number) {
        var argumentIndex = parseInt(number, 10) + 1;
        return typeof args.length <= argumentIndex ? match : args[argumentIndex];
      });
    }
  };
  onefold_js_internal = function (arrays, functions, objects, strings) {
    return {
      arrays: arrays,
      functions: functions,
      objects: objects,
      strings: strings
    };
  }(onefold_js_arrays, onefold_js_functions, onefold_js_objects, onefold_js_strings);
  onefold_js = function (main) {
    return main;
  }(onefold_js_internal);
  return onefold_js;
}();
onefold_lists = function (onefold_js) {
  var onefold_lists_internal, onefold_lists;
  onefold_lists_internal = function (js) {
    function prototyper(extensions) {
      var internal = {
        get length() {
          return this['length'];
        },
        contains: function (element) {
          return this.tryFirstIndexOf(element) >= 0;
        },
        filter: function (predicate) {
          var array = [];
          for (var i = 0; i < this.length; ++i) {
            var element = this.get(i);
            if (predicate(element, i, this))
              array.push(element);
          }
          return new ArrayList(array);
        },
        forEach: function (action) {
          for (var i = 0, length = this.length; i < length; ++i)
            action(this.get(i), i, this);
        },
        get: function (index) {
          return this['get'](index);
        },
        map: function (mapping) {
          var array = new Array(this.length);
          for (var i = 0; i < this.length; ++i)
            array[i] = mapping(this.get(i), i, this);
          return new ArrayList(array);
        },
        readOnly: function () {
          return new ReadOnlyListView(this);
        },
        slice: function (start, end) {
          var length = this.length;
          start = arguments.length <= 0 ? 0 : start >= 0 ? start : length + start;
          end = arguments.length <= 1 ? length : end >= 0 ? end : length + end;
          var resultLength = end - start;
          var array = new Array(resultLength);
          for (var i = 0; i < resultLength; ++i) {
            array[i] = this.get(start + i);
          }
          return new ArrayList(array);
        },
        toArray: function () {
          var array = new Array(this.length);
          this.forEach(function (element, index) {
            array[index] = element;
          });
          return array;
        },
        tryFirstIndexOf: function (element) {
          for (var i = 0; i < this.length; ++i)
            if (this.get(i) === element)
              return i;
          return -1;
        }
      };
      var exported = {
        get 'length'() {
          return this.length;
        },
        'contains': internal.contains,
        'filter': internal.filter,
        'forEach': internal.forEach,
        'get': function (index) {
          return this.get(index);
        },
        'map': internal.map,
        'readOnly': internal.readOnly,
        'slice': internal.slice,
        'toArray': internal.toArray,
        'tryFirstIndexOf': internal.tryFirstIndexOf
      };
      return js.objects.extend(internal, exported, extensions);
    }
    function ArrayList(array) {
      this.__array = array;
    }
    ArrayList.prototype = prototyper({
      get length() {
        return this.__array.length;
      },
      get: function (index) {
        return this.__array[index];
      },
      toArray: function () {
        return this.__array.slice();
      }
    });
    function ReadOnlyListView(list) {
      this.__list = list;
    }
    ReadOnlyListView.prototype = prototyper({
      get length() {
        return this.__list.length;
      },
      get: function (index) {
        return this.__list.get(index);
      }
    });
    return {
      newArrayList: function (array) {
        return new ArrayList(array || []);
      },
      listPrototype: prototyper
    };
  }(onefold_js);
  onefold_lists = function (main) {
    return main;
  }(onefold_lists_internal);
  return onefold_lists;
}(onefold_js);
indexed_list = function (onefold_lists, onefold_js) {
  var indexed_list_indexed_list, indexed_list;
  indexed_list_indexed_list = function (js, lists) {
    function checkId(id) {
      if (typeof id !== 'string')
        throw new Error('Ids must be strings. (given: `' + id + '`, type: `' + typeof id + '`)');
      return id;
    }
    // TODO consider calling the following functions with explicit `this` rather than passing symbol values
    function idOf(idSelector, element) {
      return idSelector(element);
    }
    function tryIndexOfById(elementIdToIndex, id) {
      return js.objects.hasOwn(elementIdToIndex, checkId(id)) ? elementIdToIndex[id] : -1;
    }
    function indexOfById(elementIdToIndex, id) {
      var index = tryIndexOfById(elementIdToIndex, id);
      if (index < 0)
        throw new Error('Es existiert kein Eintrag mit Id \'' + id + '\'.');
      return index;
    }
    function findInsertionIndex(elements, ordering, element, fromIndex, toIndex) {
      if (fromIndex >= toIndex)
        return fromIndex;
      var middle = Math.floor((fromIndex + toIndex) / 2);
      return ordering(element, elements[middle]) < 0 ? findInsertionIndex(elements, ordering, element, fromIndex, middle) : findInsertionIndex(elements, ordering, element, middle + 1, toIndex);
    }
    function reconstructElements(idSelector, originalElements, elementIdToIndex, indizes, inbetween) {
      var reconstructedElements = [];
      var appendSlice = function (fromIndex, toIndex) {
        var baseIndex = reconstructedElements.length;
        var slice = originalElements.slice(fromIndex, toIndex);
        reconstructedElements = reconstructedElements.concat(slice);
        slice.forEach(function (row) {
          elementIdToIndex[idSelector(row)] = baseIndex;
          ++baseIndex;
        });
      };
      var offset = 0;
      indizes.forEach(function (index) {
        appendSlice(offset, index);
        offset = index;
        inbetween(reconstructedElements);
      });
      appendSlice(offset, originalElements.length);
      return reconstructedElements;
    }
    function IndexedList(idSelector) {
      this.idSelector = function (element) {
        return checkId(idSelector(element));
      };
      this.elements = [];
      this.elementIdToIndex = {};
      this.ordering = null;
    }
    IndexedList.prototype = lists.listPrototype({
      get length() {
        return this.elements.length;
      },
      get: function (index) {
        return this.elements[index];
      },
      getById: function (id) {
        var index = indexOfById(this.elementIdToIndex, id);
        return this.elements[index];
      },
      clear: function () {
        this.elements = [];
        this.elementIdToIndex = {};
      },
      contains: function (element) {
        var id = idOf(this.idSelector, element);
        return tryIndexOfById(this.elementIdToIndex, id) >= 0;
      },
      containsById: function (id) {
        return tryIndexOfById(this.elementIdToIndex, id) >= 0;
      },
      defineOrdering: function (ordering) {
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        this.ordering = ordering;
        js.arrays.stableSort(elements, ordering);
        var reordered = false;
        for (var i = 0; i < elements.length; ++i) {
          var id = idSelector(elements[i]);
          reordered = reordered || elementIdToIndex[id] !== i;
          elementIdToIndex[id] = i;
        }
        return reordered;
      },
      removeAllById: function (ids) {
        if (!ids.length)
          return;
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        var indicesOffsetBy1 = ids.map(function (id) {
          return indexOfById(elementIdToIndex, id) + 1;
        });
        indicesOffsetBy1.sort(function (a, b) {
          return a - b;
        });
        this.elements = reconstructElements(idSelector, elements, elementIdToIndex, indicesOffsetBy1, function (newArray) {
          var row = newArray.pop();
          var id = idSelector(row);
          delete elementIdToIndex[id];
        });
      },
      removeAll: function (elements) {
        this.removeAllById(elements.map(this.idSelector));
      },
      updateAll: function (updatedElements) {
        if (this.ordering)
          throw new Error('`updateAll` must not be called on an ordered `IndexedTable`. Use a combination of order-preserving' + ' `tryUpdateAll`, `removeAll` and `insertAll` instead.');
        if (!updatedElements.length)
          return;
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        updatedElements.forEach(function (element) {
          var index = indexOfById(elementIdToIndex, idSelector(element));
          elements[index] = element;
        });
      },
      tryUpdateAll: function (updatedElements) {
        if (!this.ordering)
          throw new Error('`tryUpdateAll` is designed for ordered `IndexedTable`s. For unordered ones, use `updateAll` instead.');
        if (!updatedElements.length)
          return [];
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        var ordering = this.ordering;
        var failed = [];
        updatedElements.forEach(function (row) {
          var index = indexOfById(elementIdToIndex, idSelector(row));
          // TODO the below check is good (quick and easy), but when it fails we should check if the
          //      updated element is still greater/less than the one before/after before failing it
          if (ordering(row, elements[index]) !== 0)
            failed.push(row);
          else
            elements[index] = row;
        });
        return failed;
      },
      addAll: function (newElements) {
        if (this.ordering)
          throw new Error('`addAll` must not be called on an ordered `IndexedTable`. Use order-preserving `insertAll` instead.');
        if (!newElements.length)
          return;
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        newElements.forEach(function (row) {
          var id = idSelector(row);
          if (js.objects.hasOwn(elementIdToIndex, id))
            throw new Error('The list already contains an element with id `' + id + '`. Did you mean to call `updateAll`?.');
          elementIdToIndex[id] = elements.push(row) - 1;
        });
      },
      insertAll: function (newElements) {
        if (!this.ordering)
          throw new Error('`insertAll` is designed for ordered `IndexedTable`s. For unordered ones, use `addAll` instead.');
        if (!newElements.length)
          return;
        var idSelector = this.idSelector;
        var elements = this.elements;
        var elementIdToIndex = this.elementIdToIndex;
        var ordering = this.ordering;
        js.arrays.stableSort(newElements, ordering);
        var offset = 0;
        var indices = [];
        newElements.forEach(function (newElement) {
          var insertionIndex = findInsertionIndex(elements, ordering, newElement, offset, elements.length);
          indices.push(insertionIndex);
          offset = insertionIndex;
        });
        offset = 0;
        this.elements = reconstructElements(idSelector, elements, elementIdToIndex, indices, function (newArray) {
          var row = newElements[offset];
          var id = idSelector(row);
          var index = newArray.length;
          newArray.push(row);
          elementIdToIndex[id] = index;
          ++offset;
        });
      }
    });
    return IndexedList;
  }(onefold_js, onefold_lists);
  indexed_list = function (main) {
    return main;
  }(indexed_list_indexed_list);
  return indexed_list;
}(onefold_lists, onefold_js);

ko_data_source_delta = function () {
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

ko_data_source_views_subviews = {};

ko_data_source_views_abstract_view = function (ko, js, IndexedList, Delta, subviews) {
  function AbstractView(parent, indexedValues, deltas) {
    this.parent = parent;
    this.indexedValues = indexedValues || new IndexedList(this.idSelector);
    this.deltas = deltas || ko.observable(new Delta());
    this._values = ko.observable(this.indexedValues.readOnly());
    this._observables = null;
  }
  AbstractView.prototype = {
    get idSelector() {
      return this.parent.idSelector;
    },
    get observableEntries() {
      return this.parent.observableEntries;
    },
    get getValues() {
      return this._values;
    },
    get getObservables() {
      if (!this._observables)
        this._observables = ko.observable(this.indexedValues.map(this.observableEntries.addReference));
      return this._observables;
    },
    get values() {
      return this.getValues;
    },
    get observables() {
      return this.getObservables;
    },
    synchronizeObservables: function (delta) {
      this._values.valueHasMutated();
      if (this._observables) {
        delta.added.forEach(this.observableEntries.addReference);
        this._observables(this.indexedValues.map(this.observableEntries.lookup));
        delta.removed.forEach(this.observableEntries.releaseReference);
      }
    },
    releaseObservableReferences: function () {
      if (this._observables)
        this.indexedValues.forEach(this.observableEntries.releaseReference);
    },
    filteredBy: function (predicate) {
      return new subviews.FilteredView(this, predicate);
    },
    orderedBy: function (ordering) {
      return new subviews.OrderedView(this, ordering);
    },
    clipped: function (offset, size) {
      return new subviews.ClippedView(this, offset, size);
    },
    dispose: function () {
      this['dispose']();
    }
  };
  Object.defineProperty(AbstractView.prototype, 'values', {
    'enumerable': true,
    'get': function () {
      return this.getValues;
    }
  });
  Object.defineProperty(AbstractView.prototype, 'observables', {
    'enumerable': true,
    'get': function () {
      return this.getObservables;
    }
  });
  AbstractView.prototype['filteredBy'] = AbstractView.prototype.filteredBy;
  AbstractView.prototype['orderedBy'] = AbstractView.prototype.orderedBy;
  AbstractView.prototype['clipped'] = AbstractView.prototype.clipped;
  return AbstractView;
}(knockout, onefold_js, indexed_list, ko_data_source_delta, ko_data_source_views_subviews);

ko_data_source_views_root_view = function (ko, js, AbstractView) {
  function RootView(idSelector, observableEntries, values, deltas) {
    AbstractView.call(this, {
      idSelector: idSelector,
      observableEntries: observableEntries
    }, values, deltas);
    this.deltaSubscription = deltas.subscribe(function (delta) {
      this.synchronizeObservables(delta);
    }.bind(this));
  }
  RootView.prototype = js.objects.extend({}, AbstractView.prototype, {
    'dispose': function () {
      this.deltaSubscription.dispose();
      this.releaseObservableReferences();
    }
  });
  return RootView;
}(knockout, onefold_js, ko_data_source_views_abstract_view);

ko_data_source_views_filtered_view = function (ko, js, Delta, AbstractView, subviews) {
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
    this.computer = ko.computed(function () {
      var oldValues = this.indexedValues.toArray();
      var newValues = this.parent.indexedValues.filter(ko.unwrap(predicate)).toArray();
      var delta = new Delta(newValues, [], oldValues);
      this.indexedValues.clear();
      this.indexedValues.addAll(newValues);
      this.synchronizeObservables(delta);
      delta.propagateTo(this.deltas);
    }.bind(this));
    this.deltaSubscription = parent.deltas.subscribe(function (delta) {
      var filtered = filterDelta(this.idSelector, this.indexedValues, delta, ko.unwrap(predicate));
      if (filtered.empty)
        return;
      this.indexedValues.removeAll(filtered.removed);
      this.indexedValues.updateAll(filtered.updated);
      this.indexedValues.addAll(filtered.added);
      this.synchronizeObservables(delta);
      filtered.propagateTo(this.deltas);
    }.bind(this));
  }
  FilteredView.prototype = js.objects.extend({}, AbstractView.prototype, {
    'dispose': function () {
      this.computer.dispose();
      this.deltaSubscription.dispose();
      this.releaseObservableReferences();
    }
  });
  subviews.FilteredView = FilteredView;
  return FilteredView;
}(knockout, onefold_js, ko_data_source_delta, ko_data_source_views_abstract_view, ko_data_source_views_subviews);

ko_data_source_views_ordered_view = function (ko, js, AbstractView, subviews) {
  function OrderedView(parent, ordering) {
    AbstractView.call(this, parent);
    this.indexedValues.addAll(parent.indexedValues.toArray());
    this.computer = ko.computed(function () {
      if (this.indexedValues.defineOrdering(ko.unwrap(ordering)))
        this.deltas.valueHasMutated();
    }.bind(this));
    this.deltaSubscription = parent.deltas.subscribe(function (delta) {
      var failedUpdates = this.indexedValues.tryUpdateAll(delta.updated);
      this.indexedValues.removeAll(delta.removed.concat(failedUpdates));
      this.indexedValues.insertAll(delta.added.concat(failedUpdates));
      this.synchronizeObservables(delta);
      this.deltas.valueHasMutated();
    }.bind(this));
  }
  OrderedView.prototype = js.objects.extend({}, AbstractView.prototype, {
    'filteredBy': function () {
      throw new Error('Filtering an ordered view is not supported.');
    },
    'orderedBy': function () {
      throw new Error('Ordering an ordered view is not supported.');
    },
    'dispose': function () {
      this.computer.dispose();
      this.deltaSubscription.dispose();
      this.releaseObservableReferences();
    }
  });
  subviews.OrderedView = OrderedView;
  return OrderedView;
}(knockout, onefold_js, ko_data_source_views_abstract_view, ko_data_source_views_subviews);

ko_data_source_views_clipped_view = function (ko, js, lists, subviews) {
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
  function ClippedView(parent, offset, size) {
    var observableEntries = parent.observableEntries;
    this.__observableEntries = observableEntries;
    this.__values = ko.observable(lists.newArrayList());
    this.__observables = null;
    var idSelector = parent.idSelector;
    this.computer = ko.computed(function () {
      // the delta isn't worth much to clipping, so we reuse the computer
      parent.deltas();
      var unclipped = parent.indexedValues;
      var from = Math.min(unclipped.length, ko.unwrap(offset));
      var to = Math.min(unclipped.length, from + ko.unwrap(size));
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
    get getValues() {
      return this.__values;
    },
    get getObservables() {
      if (!this.__observables)
        this.__observables = ko.observable(this.values().map(this.__observableEntries.addReference));
      return this.__observables;
    },
    get values() {
      return this.getValues;
    },
    get observables() {
      return this.getObservables;
    },
    filteredBy: function () {
      throw new Error('Filtering a clipped view is not supported.');
    },
    orderedBy: function () {
      throw new Error('Ordering a clipped view is not supported.');
    },
    clipped: function () {
      throw new Error('Clipping a clipped view is not supported.');
    },
    dispose: function () {
      this.computer.dispose();
      if (this.__observables)
        this.__values().forEach(this.__observableEntries.releaseReference);
    }
  });
  Object.defineProperty(ClippedView.prototype, 'values', {
    'enumerable': true,
    'get': function () {
      return this.getValues;
    }
  });
  Object.defineProperty(ClippedView.prototype, 'observables', {
    'enumerable': true,
    'get': function () {
      return this.getObservables;
    }
  });
  ClippedView.prototype['filteredBy'] = ClippedView.prototype.filteredBy;
  ClippedView.prototype['orderedBy'] = ClippedView.prototype.orderedBy;
  ClippedView.prototype['clipped'] = ClippedView.prototype.clipped;
  ClippedView.prototype['dispose'] = ClippedView.prototype.dispose;
  subviews.ClippedView = ClippedView;
  return ClippedView;
}(knockout, onefold_js, onefold_lists, ko_data_source_views_subviews);

ko_data_source_views_views = function (RootView) {
  return { RootView: RootView };
}(ko_data_source_views_root_view);

ko_data_source_client_side_data_source = function (ko, js, IndexedList, views, Delta) {
  return function ClientSideDataSource(idSelector, observableEntries) {
    var values = new IndexedList(idSelector);
    var deltas = ko.observable(new Delta());
    this.openEntryView = function (entryId) {
      var optionalEntryView = this.openOptionalEntryView(entryId);
      var subscription = null;
      return {
        value: optionalEntryView.value.bind(optionalEntryView),
        observable: function () {
          if (!subscription) {
            subscription = optionalEntryView.optionalObservable().subscribe(function () {
              throw new Error('Es ist noch eine nicht-optionale View zum entfernten Eintrag offen.');
            });
          }
          return optionalEntryView.observable();
        },
        dispose: function () {
          if (subscription)
            subscription.dispose();
          optionalEntryView.dispose();
        }
      };
    }.bind(this);
    this.openOptionalEntryView = function (entryId) {
      var disposed = false;
      var lastKnownValue = null;
      var observable = null;
      var optionalObservable = null;
      var subscription = null;
      var assertNotDisposed = function () {
        if (disposed)
          throw new Error('Ung\xFCltiger Zustand: Diese Entry-View wurde bereits freigegeben.');
      };
      var optionalEntryView = {
        value: function () {
          assertNotDisposed();
          lastKnownValue = values.getById(entryId);
          return lastKnownValue;
        },
        observable: function () {
          assertNotDisposed();
          if (!observable)
            observable = observableEntries.addReference(optionalEntryView.value());
          return observable;
        },
        optionalObservable: function () {
          assertNotDisposed();
          if (optionalObservable)
            return optionalObservable;
          var sharedObservable = observableEntries.addOptionalReference(optionalEntryView.value());
          observable = sharedObservable();
          optionalObservable = ko.observable({
            present: true,
            value: optionalEntryView.observable()
          });
          subscription = sharedObservable.subscribe(function () {
            optionalObservable({
              present: false,
              value: optionalEntryView.observable()
            });
          });
          return optionalObservable;
        },
        dispose: function () {
          assertNotDisposed();
          disposed = true;
          if (subscription) {
            subscription.dispose();
            subscription = null;
            observableEntries.releaseReference(lastKnownValue);
            observable = null;
          }
        }
      };
      return optionalEntryView;
    };
    this.openView = function () {
      return new views.RootView(idSelector, observableEntries, values, deltas);
    };
    this['openView'] = this.openView;
    this['addEntries'] = function (newEntries) {
      values.addAll(newEntries);
      new Delta(newEntries).propagateTo(deltas);
    };
    this['updateEntries'] = function (updatedEntries) {
      values.updateAll(updatedEntries);
      new Delta([], updatedEntries).propagateTo(deltas);
      observableEntries.updateEntries(updatedEntries);
    };
    this['addOrUpdateEntries'] = function (entries) {
      var added = [];
      var updated = [];
      entries.forEach(function (entry) {
        (values.contains(entry) ? updated : added).push();
      });
      new Delta(added, updated).propagateTo(deltas);
    };
    this['removeEntries'] = function (entries) {
      values.removeAll(entries);
      new Delta([], [], entries).propagateTo(deltas);
    };
    this['replaceEntries'] = function (newEntries) {
      var removedEntries = values.toArray();
      values.clear();
      values.addAll(newEntries);
      new Delta(newEntries, [], removedEntries).propagateTo(deltas);
      // TODO update only those that were already there before the delta was propagated
      observableEntries.updateEntries(newEntries);
    };
    this.dispose = function () {
    };
  };
}(knockout, onefold_js, indexed_list, ko_data_source_views_views, ko_data_source_delta);

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
  var Entry = function (observable) {
    this.observable = observable;
    this.optionalObservable = ko.observable(observable);
    this.refcount = 1;
  };
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
      throw new Error('Ids m\xFCssen Strings sein. Unerwartete Id \'' + id + '\' des Typs \'' + typeof id + '\'.');
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
      var entry = new Entry(observableStateTransitioner.constructor(value));
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
}(ko_data_source_client_side_data_source, ko_data_source_default_observable_state_transitioner, ko_data_source_observable_entries);
ko_data_source = function (main) {
  return main;
}(ko_data_source_ko_data_source);return ko_data_source;
}));