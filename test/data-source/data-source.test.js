'use strict';

define([
    './open-view/open-view.test',
    './open-entry-view.test',
    './open-optional-entry-view.test',
    './stream-values.test'
], function () {
    var tests = Array.prototype.slice.call(arguments);

    return (name, factory) => {
        describe('DataSource (' + name + '):', () => {
            Array.prototype.slice.call(tests).forEach(test => test(factory));
        });
    };
});
