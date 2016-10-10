/* jslint esversion: 6, -W097, browser: true */
/* globals require */

'use strict';

var moment = require("moment");

var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

export class DateRange {
    constructor(start, end) {
        if ((start instanceof Date) || (typeof start == 'number')){
            start = moment.utc(start).startOf('day');
        }
        if ((end instanceof Date) || (typeof end == 'number')){
            end = moment.utc(end).startOf('day');
        }
        this.start = start;
        this.end = end;
    }

    days() {
        return Math.floor((this.end - this.start) / DAY);
    }

    isInside(outer) {
        //outer = moment.utc(outer).startOf('day');
        return +this.start <= +outer && +this.end >= +outer;
    }
}

