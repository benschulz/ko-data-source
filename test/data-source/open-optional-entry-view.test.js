'use strict';

define([''], function () {
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


        describe('openOptionalEntryView:', () => {
            it('Opening an optional entry view for a non-existent value should fail.', () => {
                var dataSource = createUserDataSource();

                expect(()=> dataSource.openOptionalEntryView('42')).to.throw();
            });

            it('The entry\'s value should be accessible for existent entries.', done => {
                withAlice(dataSource => {
                    var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                    expect(entryView.value).to.equal(ALICE);
                    done();
                });
            });

            it('The entry\'s observable should be accessible for existent entries.', done => {
                withAlice(dataSource => {
                    var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                    expect(entryView.observable.name()).to.equal(ALICE_NAME);
                    done();
                });
            });

            it('Two views of the same entry should return the same observable.', done => {
                withAlice(dataSource => {
                    var entryViewA = dataSource.openOptionalEntryView(ALICE_ID),
                        entryViewB = dataSource.openOptionalEntryView(ALICE_ID);

                    expect(entryViewA.observable).to.equal(entryViewB.observable);
                    done();
                });
            });

            it('An entry view should return the same observable as a regular view does for that entry.', done => {
                withAlice((dataSource, regularView) => {
                    var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                    expect(entryView.observable).to.equal(regularView.observables().get(0));
                    done();
                });
            });

            it('An entry\'s optional observable should initially contain an observable and have `present` set to `true`.', done => {
                withAlice(dataSource => {
                    var entryView = dataSource.openOptionalEntryView(ALICE_ID);

                    expect(entryView.optionalObservable().present).to.be.true;
                    expect(entryView.optionalObservable().observable.name()).to.be.equal(ALICE_NAME);
                    done();
                });
            });
        });
    };
});
