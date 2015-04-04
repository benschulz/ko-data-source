'use strict';

define(['./create-client-side-data-source.test'], function (createClientSideDataSource) {
    var ALICE_ID = '123';
    var ALICE_NAME = 'Alice';
    var ALICE = {id: ALICE_ID, name: ALICE_NAME};

    function createUserDataSource(initialEntries) {
        return createClientSideDataSource(initialEntries, {
            observableProperties: ['name']
        });
    }

    return () => {
        describe('openOptionalEntryView:', () => {
            it('Accessing the value of an optional entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(()=> dataSource.openOptionalEntryView('42').value).to.throw();
            });

            it('Accessing the observable of an optional entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(()=> dataSource.openOptionalEntryView('42').observable).to.throw();
            });

            it('The entry\'s value should be accessible for existent entries.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                expect(entryView.value).to.equal(ALICE);
            });

            it('The entry\'s observable should be accessible for existent entries.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                expect(entryView.observable.name()).to.equal(ALICE_NAME);
            });

            it('Two views of the same entry should return the same observable.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryViewA = dataSource.openOptionalEntryView(ALICE_ID),
                    entryViewB = dataSource.openOptionalEntryView(ALICE_ID);

                expect(entryViewA.observable).to.equal(entryViewB.observable);
            });

            it('An entry view should return the same observable as a regular view does for that entry.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openOptionalEntryView(ALICE_ID),
                    regularView = dataSource.openView();

                expect(entryView.observable).to.equal(regularView.observables().get(0));
            });

            it('An entry\'s optional observable should initially contain an observable and have `present` set to `true`.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                expect(entryView.optionalObservable().present).to.be.true;
                expect(entryView.optionalObservable().observable.name()).to.be.equal(ALICE_NAME);
            });

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
