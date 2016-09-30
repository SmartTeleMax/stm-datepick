(function() {
    'use strict';

    var SECOND = 1000;
    var MINUTE = 60 * SECOND;
    var HOUR = 60 * MINUTE;
    var DAY = 24 * HOUR;
    var WEEK = 7 * DAY;

    function DateRange(start, end) {
        if ((start instanceof Date) || (typeof start == 'number')){
            start = moment.utc(start).startOf('day');
        }
        if ((end instanceof Date) || (typeof end == 'number')){
            end = moment.utc(end).startOf('day');
        }
        this.start = start;
        this.end = end;
    }

    DateRange.prototype.days = function() {
        return Math.floor((this.end - this.start) / DAY);
    };

    DateRange.prototype.isInside = function(outer) {
        //outer = moment.utc(outer).startOf('day');
        return +this.start <= +outer && +this.end >= +outer;
    };

    DateRange.SECOND = SECOND;
    DateRange.MINUTE = MINUTE;
    DateRange.HOUR = HOUR;
    DateRange.DAY = DAY;
    DateRange.WEEK = WEEK;
    window.DateRange = DateRange;
})();
