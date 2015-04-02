'use strict';

define(['./create-client-side-data-source.test'], function (createClientSideDataSource) {
    function range(size) {
        return Array.apply(null, new Array(size)).map((_, i) => i);
    }

    function parameterize(parametrization) {
        parametrization(1);
        parametrization(2);
        parametrization(5);
        parametrization(100);
    }

    return () => {
        describe('size:', () => {
            it('A size should be `0` initially.', () => {
                var dataSource = createClientSideDataSource();

                expect(dataSource.size()).to.equal(0);
            });

            it('Size remain constant when updating entries.', () => {
                var dataSource = createClientSideDataSource(range(100));

                dataSource.updateEntries(range(100).slice(10, 90));

                expect(dataSource.size()).to.equal(100);
            });

            describe('The size should equal ', ()=> {
                parameterize(count => {
                    it('`' + count + '` after adding `' + count + '` entries.', () => {
                        var dataSource = createClientSideDataSource();

                        dataSource.addEntries(range(count));

                        expect(dataSource.size()).to.equal(count);
                    });
                });

                parameterize(count => {
                    var initialSize = 100;
                    var expectedSize = initialSize - count;

                    it('`' + expectedSize + '` after removing `' + count + '` entries from a `' + initialSize + '` entry data source.', () => {
                        var dataSource = createClientSideDataSource(range(initialSize));

                        dataSource.removeEntries(range(count));

                        expect(dataSource.size()).to.equal(expectedSize);
                    });
                });

                it('`50` after replacing the existing entries with 50 different ones', () => {
                    var dataSource = createClientSideDataSource(range(50));

                    dataSource.replaceEntries(range(75).slice(25));

                    expect(dataSource.size()).to.equal(50);
                });

                it('`30` after add-or-updating `20` entries of a `20` entry data source with a `10` entry intersection.', () => {
                    var dataSource = createClientSideDataSource(range(20));

                    dataSource.addOrUpdateEntries(range(30).slice(10));

                    expect(dataSource.size()).to.equal(30);
                });
            });
        });
    };
});
