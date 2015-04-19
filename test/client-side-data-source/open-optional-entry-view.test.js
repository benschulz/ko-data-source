'use strict';

define(['./create-client-side-data-source.test'], function (createClientSideDataSource) {
    return () => {
        var ALICE_ID = '123';
        var ALICE_NAME = 'Alice';
        var ALICE = {id: ALICE_ID, name: ALICE_NAME};

        function createUserDataSource(initialEntries) {
            return createClientSideDataSource(initialEntries, {
                observableProperties: ['name']
            });
        }

        describe('openOptionalEntryView:', () => {
            it('An entry\'s optional observable should not contain an observable and have `present` set to `false` after the entry was removed.', () => {
                var dataSource = createUserDataSource([ALICE]),
                    entryView = dataSource.openOptionalEntryView(ALICE_ID),
                    optionalObservable = entryView.optionalObservable;

                dataSource.removeEntries([ALICE]);

                expect(optionalObservable().present).to.be.false;
                expect(optionalObservable().observable).to.be.null;
            });

            it('An entry\'s optional observable should contain an observable and have `present` set to `true` after the entry was removed an readded.', () => {
                var dataSource = createUserDataSource([ALICE]),
                    entryView = dataSource.openOptionalEntryView(ALICE_ID),
                    optionalObservable = entryView.optionalObservable;

                dataSource.removeEntries([ALICE]);
                dataSource.addEntries([ALICE]);

                expect(optionalObservable().present).to.be.true;
                expect(optionalObservable().observable.name()).to.be.equal(ALICE_NAME);
            });
        });
    };
});
