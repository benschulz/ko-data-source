'use strict';

define([], function () {
    function Delta(added, updated, removed) {
        this.added = added || [];
        this.updated = updated || [];
        this.removed = removed || [];
    }

    Delta.prototype = {
        get size() { return this.added.length + this.updated.length + this.removed.length; },
        get empty() {return !this.size;},

        propagateTo: function (deltas) {
            if (!this.empty)
                deltas(this);
        }
    };

    return Delta;
});
