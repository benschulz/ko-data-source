'use strict';

require(['require', 'chai'], function (require, chai) {
    mocha.setup('bdd');

    window.expect = chai.expect;

    chai.use(function (_chai, utils) {
        function isList(object) {
            return typeof object.length === 'number' && typeof object.get === 'function' && typeof object.toArray === 'function';
        }

        function toArray(listOrArray) {
            return isList(listOrArray) ? listOrArray.toArray() : listOrArray;
        }

        utils.overwriteMethod(_chai.Assertion.prototype, 'eql', function (_super) {
            return function (other) {
                var object = utils.flag(this, 'object');
                if (isList(object)) {
                    new _chai.Assertion(object.toArray()).to.eql(toArray(other));
                } else {
                    _super.apply(this, arguments);
                }
            };
        });

        utils.addMethod(_chai.Assertion.prototype, 'all', function (elements) {
            if (!utils.flag(this, 'contains'))
                throw new Error('`all` is only defined in a `contains` context.');

            new chai.Assertion(toArray(utils.flag(this, 'object'))).to.contain.members(toArray(elements));
        });

        utils.addMethod(_chai.Assertion.prototype, 'exactly', function (elements) {
            if (!utils.flag(this, 'contains'))
                throw new Error('`exactly` is only defined in a `contains` context.');

            var objectAsArray = toArray(utils.flag(this, 'object'));
            var elementsAsArray = toArray(elements);

            new chai.Assertion(objectAsArray).to.have.length(elementsAsArray.length);
            while (objectAsArray.length) {
                new chai.Assertion(objectAsArray).to.contain(elementsAsArray[0]);
                objectAsArray.splice(objectAsArray.indexOf(elementsAsArray[0]), 1);
                elementsAsArray.shift();
            }
        });
    });

    require([
        'client-side-data-source/client-side-data-source.test',
        'server-side-data-source/server-side-data-source.test'
    ], function () {
        window.__karma__.start();
    });

});
