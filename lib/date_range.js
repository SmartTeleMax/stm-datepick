/* jslint esversion: 6, -W097, browser: true */
/* globals require */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var moment = require("moment");

var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

var DateRange = exports.DateRange = function () {
    function DateRange(start, end) {
        _classCallCheck(this, DateRange);

        if (start instanceof Date || typeof start == 'number') {
            start = moment.utc(start).startOf('day');
        }
        if (end instanceof Date || typeof end == 'number') {
            end = moment.utc(end).startOf('day');
        }
        this.start = start;
        this.end = end;
    }

    _createClass(DateRange, [{
        key: 'days',
        value: function days() {
            return Math.floor((this.end - this.start) / DAY);
        }
    }, {
        key: 'isInside',
        value: function isInside(outer) {
            //outer = moment.utc(outer).startOf('day');
            return +this.start <= +outer && +this.end >= +outer;
        }
    }]);

    return DateRange;
}();