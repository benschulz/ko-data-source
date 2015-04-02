'use strict';

define(['./create-client-side-data-source.test'], function (createClientSideDataSource) {
    var ALICE_ID = '1';
    var ALICE_NAME = 'Alice';
    var ALICE = {id: ALICE_ID, name: ALICE_NAME};
    var BOB_ID = '2';
    var BOB_NAME = 'Bob';
    var BOB = {id: BOB_ID, name: BOB_NAME};
    var CAROL_ID = '3';
    var CAROL_NAME = 'Carol';
    var CAROL = {id: CAROL_ID, name: CAROL_NAME};
    var DAN_ID = '4';
    var DAN_NAME = 'Dan';
    var DAN = {id: DAN_ID, name: DAN_NAME};

    return () => {
        function createUserDataSource() {
            return createClientSideDataSource([DAN, CAROL, ALICE, BOB]);
        }

        describe('streamValues:', () => {
            it('If the query is left unconfigured all values should be yielded in no particular order.', done => {
                var dataSource = createUserDataSource();

                dataSource.streamValues()
                    .then(s => s.reduce((a, b) => a.concat([b]), []))
                    .should.eventually.contain.exactly([ALICE, BOB, CAROL, DAN])
                    .notify(done);
            });

            it('If a predicate is configured only values satisfying it should be yielded in no particular order.', done => {
                var dataSource = createUserDataSource();

                dataSource.streamValues(q => q.filteredBy(u => u.name !== DAN_NAME))
                    .then(s => s.reduce((a, b) => a.concat([b]), []))
                    .should.eventually.contain.exactly([ALICE, BOB, CAROL])
                    .notify(done);
            });

            it('If a comparator is configured values should be yielded in a corresponding order.', done => {
                var dataSource = createUserDataSource();

                dataSource.streamValues(q => q.sortedBy((a, b) => -a.name.localeCompare(b.name)))
                    .then(s => s.reduce((a, b) => a.concat([b]), []))
                    .should.eventually.eql([DAN, CAROL, BOB, ALICE])
                    .notify(done);
            });

            it('If an offset is configured only values from that offset on should be yielded.', done => {
                var dataSource = createUserDataSource();

                dataSource.streamValues(q => q.sortedBy((a, b) => a.name.localeCompare(b.name)).offsetBy(2))
                    .then(s => s.reduce((a, b) => a.concat([b]), []))
                    .should.eventually.eql([CAROL, DAN])
                    .notify(done);
            });

            it('If a limit of `2` is configured no more than `2` values should be yielded.', done => {
                var dataSource = createUserDataSource();

                dataSource.streamValues(q => q.sortedBy((a, b) => a.name.localeCompare(b.name)).limitedTo(2))
                    .then(s => s.reduce((a, b) => a.concat([b]), []))
                    .should.eventually.eql([ALICE, BOB])
                    .notify(done);
            });
        });
    };
});
