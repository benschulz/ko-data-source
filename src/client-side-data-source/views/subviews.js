'use strict';

define([], function () {
    // This module breaks the cycle between AbstractView and FilteredView, SortedView and ClippedView.
    // The views module makes sure the three modules above are loaded and registered here.
    return {};
});
