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
        describe('openEntryView:', () => {
            it('Accessing the value of an entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(()=> dataSource.openEntryView('42').value).to.throw();
            });

            it('Accessing the observable of an entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(()=> dataSource.openEntryView('42').observable).to.throw();
            });

            it('The entry\'s value should be accessible for existent entries.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openEntryView(ALICE_ID);

                expect(entryView.value).to.equal(ALICE);
            });

            it('The entry\'s observable should be accessible for existent entries.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openEntryView(ALICE_ID);

                expect(entryView.observable.name()).to.equal(ALICE_NAME);
            });

            it('Two views of the same entry should return the same observable.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryViewA = dataSource.openEntryView(ALICE_ID),
                    entryViewB = dataSource.openEntryView(ALICE_ID);

                expect(entryViewA.observable).to.equal(entryViewB.observable);
            });

            it('An entry view should return the same observable as a regular view does for that entry.', () => {
                var dataSource = createUserDataSource([ALICE]);

                var entryView = dataSource.openEntryView(ALICE_ID),
                    regularView = dataSource.openView();

                expect(entryView.observable).to.equal(regularView.observables().get(0));
            });

            it('Removing an entry should fail when a non-optional view is open and active for that entry.', () => {
                var dataSource = createUserDataSource([ALICE]);
                dataSource.openEntryView(ALICE_ID).observable;

                expect(()=> dataSource.removeEntries([ALICE])).to.throw();
            });

            it('Disposing the data source should fail when a non-optional view is open and active.', () => {
                var dataSource = createUserDataSource([ALICE]);
                dataSource.openEntryView(ALICE_ID).observable;

                expect(()=> dataSource.dispose()).to.throw();
            });

            it('Removing an entry should succeed after a non-optional view has been disposed, which was open and active.', () => {
                var dataSource = createUserDataSource([ALICE]),
                    entryView = dataSource.openEntryView(ALICE_ID);
                entryView.observable;
                entryView.dispose();

                dataSource.removeEntries([ALICE]);
            });
        });
    };
});
