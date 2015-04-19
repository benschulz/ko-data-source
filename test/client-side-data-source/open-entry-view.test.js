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

        describe('openEntryView:', () => {
            it('Removing an entry should fail when a non-optional view is open and active for that entry.', () => {
                var dataSource = createUserDataSource([ALICE]);
                dataSource.openEntryView(ALICE_ID);

                expect(()=> dataSource.removeEntries([ALICE])).to.throw();
            });

            it('Removing an entry should succeed after a non-optional view has been disposed, which was open and active.', () => {
                var dataSource = createUserDataSource([ALICE]);
                var entryView = dataSource.openEntryView(ALICE_ID);
                entryView.dispose();

                dataSource.removeEntries([ALICE]);
            });
        });
    };
});
