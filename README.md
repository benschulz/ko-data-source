# ko-data-source

This module implements the data source API required by [ko-grid](https://github.com/benschulz/ko-grid). The API allows for filtering, sorting and "clipping" (offset+limit) of all entries.

## Requirements

**Libraries**. The only dependency is [knockout](http://knockoutjs.com/).

**Browser**. This module has been tested on recent builds of Firefox, Chromium, Midori (WebKit based) and Internex Explorer 11. Internet Explorer 10 is supported as well, as long as a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) polyfill is present.

## Concepts

### Data Source

The core concept implemented by this module is the *data source*. A data source is a collection of similarly shaped entries, e.g. a collection of users. Beyond a size, data sources do not directly offer any information on their entries. For that one has to go through a view or stream its contents.

### View

Data sources offer an `openView`-method which return views onto the data source. When opening a view, a predicate for filtering, a comparator for ordering, as well as an offset and a limit can be specified to affect the contents of the view.

All four of the view parameters (predicate, comparator, offset and limit) may be knockout subscribables. If any of them are and change their value, the view becomes `dirty` until it can reflect the change.

Views know their size, their filtered size (what their size would be if neither an offset nor a limit were specified) as well as their entries. A views entries are accessible though its properties `values` and `observables`.

### Values and Observables

The data source API differentiates between values and observables. Values are POJOs, generally JSON-deserialized objects left as-is. Observables are the corresponding knockout view models.

From a convenience point of view, one would generally prefer to work with observables. However, `ko.observable`s are fairly expensive objects, both in terms of time and space. Therefore it is recommended to work with values where possible and with observables where necessary.

### Streams

Other than the `openView` method, data sources offer two methods other methods, `streamValues` and `streamObservables`. Both return a one-time stream of its entries.

## Use

**Note**: To increase readability, the following code samples use arrow function syntax.

### Creating a `ClientSideDataSource`

```javascript
var ClientSideDataSource = require('ko-data-source').ClientSideDataSource;

var users = new ClientSideDataSource(e => e.id);

users.addEntries([
	{ id: 'alice', name: 'Alice', gender: 'female', age: 26 },
	{ id: 'bob', name: 'Bob', gender: 'male', age 32 },
	{ id: 'carol', name: 'Carol', gender: 'female', age: 44 },
	{ id: 'dan', name: 'Dan', gender: 'male', age: 19 }
]);
```

### Creating a `ServerSideDataSource`

```javascript
var koDataSource = require('ko-data-source');
var ServerSideDataSource = koDataSource.ServerSideDataSource;

var users = new ServerSideDataSource(e => e.id, {
	issue: query => new Promise((resolve, reject) => {
        // The expected result is defined by the arguments
        //   query.predicate, query.comparator, query.offset and query.limit
        //
    	// => AJAX request the desired values from the server.
        var values = /* ... */;
        resolve(koDataSource.streams.streamArray(values));
    })
});

```

### Opening views

```javascript
// A view of [Bob, Dan], not necessarily in that order
var maleUsers = users.openView(q => q.filteredBy(e => e.gender === 'male'));

// A view of [Dan, Alice, Bob, Carol], in that order
var usersSortedByAge = users.openView(q => q.sortedBy((e1, e2) => e1.age - e2.age));
```
