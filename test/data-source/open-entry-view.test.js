'use strict';

define([], function () {
    return factory => {
        var ALICE_ID = '123';
        var ALICE_NAME = 'Alice';
        var ALICE = {id: ALICE_ID, name: ALICE_NAME};

        function createUserDataSource(initialEntries) {
            return factory(initialEntries, {
                observableProperties: ['name']
            });
        }

        function withEntryPresent(dataSource, entryId, action) {
            var view = dataSource.openView(q => q.filteredBy(v => v.id === entryId));
            view.values.subscribe(() => {});

            if (!view.dirty())
                action(dataSource, view);
            else
                view.dirty.subscribe(() => action(dataSource, view));
        }

        function withAlice(action) {
            withEntryPresent(createUserDataSource([ALICE]), ALICE_ID, action);
        }

        describe('openEntryView:', () => {
            it('Opening an entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(() => dataSource.openEntryView('42')).to.throw();
            });

            it('The entry\'s value should be accessible for existent entries.', done => {
                withAlice(dataSource => {
                    var entryView = dataSource.openEntryView(ALICE_ID);

                    expect(entryView.value).to.equal(ALICE);
                    done();
                });
            });

            it('The entry\'s observable should be accessible for existent entries.', done => {
                withAlice(dataSource => {
                    var entryView = dataSource.openEntryView(ALICE_ID);

                    expect(entryView.observable.name()).to.equal(ALICE_NAME);
                    done();
                });
            });

            it('Two views of the same entry should return the same observable.', done => {
                withAlice(dataSource => {
                    var entryViewA = dataSource.openEntryView(ALICE_ID),
                        entryViewB = dataSource.openEntryView(ALICE_ID);

                    expect(entryViewA.observable).to.equal(entryViewB.observable);
                    done();
                });
            });

            it('An entry view should return the same observable as a regular view does for that entry.', done => {
                withAlice((dataSource, regularView) => {
                    var entryView = dataSource.openEntryView(ALICE_ID);

                    expect(entryView.observable).to.equal(regularView.observables().get(0));
                    done();
                });
            });

            it('Disposing the data source should fail when a non-optional view is open and active.', done => {
                withAlice(dataSource => {
                    dataSource.openEntryView(ALICE_ID);

                    expect(()=> dataSource.dispose()).to.throw();
                    done();
                });
            });
        });
    };
});
