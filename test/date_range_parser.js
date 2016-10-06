/* Test cases */

require('core-js');
var assert = require('chai').assert;
var DateRangeParser = require("../lib/date_range_parser").DateRangeParser;


function UTCDate(year, month, day) {
    return new Date(Date.UTC(year, month-1, day, 0, 0, 0, 0));
}
function UTCDateEnd(year, month, day) {
    return new Date(+UTCDate(year, month, day));// + msDay - 1);
}



var testCases = [
    {value: 'сегодня',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 9), end: UTCDateEnd(2015, 6, 9) }},

    {value: 'за неделю',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 3), end: UTCDateEnd(2015, 6, 9) }},

    {value: 'в этом месяце',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 1), end: UTCDateEnd(2015, 6, 9) }},

    {value: 'в этом году',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 1, 1), end: UTCDateEnd(2015, 6, 9) }},

    {value: 'вчера',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 8), end: UTCDateEnd(2015, 6, 8) }},

    {value: 'позавчера',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 7), end: UTCDateEnd(2015, 6, 7) }},

    {value: 'на прошлой неделе',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 1), end: UTCDateEnd(2015, 6, 7) }},

    {value: 'в прошлом месяце',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 5, 1), end: UTCDateEnd(2015, 5, 31) }},

    {value: 'в прошлом году',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2014, 1, 1), end: UTCDateEnd(2014, 12, 31) }},

    {value: '2015',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 1, 1), end: UTCDateEnd(2015, 6, 9) }},

    {value: '2014',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2014, 1, 1), end: UTCDateEnd(2014, 12, 31) }},

    {value: '1999',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(1999, 12, 31), end: UTCDateEnd(1999, 12, 31) }},

    {value: 'декабрь',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2014, 12, 1), end: UTCDateEnd(2014, 12, 31) }},

    {value: 'июнь',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 1), end: UTCDateEnd(2015, 6, 9) }},

    {value: 'март',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 3, 1), end: UTCDateEnd(2015, 3, 31) }},

    {value: '5 марта',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 3, 5), end: UTCDateEnd(2015, 3, 5) }},

    {value: '9 июня',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 6, 9), end: UTCDateEnd(2015, 6, 9) }},

    {value: '10 июня',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {} },

    {value: '9 декабря',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2014, 12, 9), end: UTCDateEnd(2014, 12, 9) }},

    {value: '9 декабря',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2017, 6, 9)},
     out: {start: UTCDate(2014, 12, 9), end: UTCDateEnd(2014, 12, 9) }},

    {value: '9 декабря 2010',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2010, 12, 9), end: UTCDateEnd(2010, 12, 9) }},

    {value: 'март 2010',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2010, 3, 1), end: UTCDateEnd(2010, 3, 31) }},

    {value: '10.10.2010',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2010, 10, 10), end: UTCDateEnd(2010, 10, 10) }},

    {value: '10.10.10',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2010, 10, 10), end: UTCDateEnd(2010, 10, 10) }},

    {value: 'с 10 апреля по 20 апреля',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 4, 10), end: UTCDateEnd(2015, 4, 20) }},

    {value: 'с 10 по 20 апреля',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 4, 10), end: UTCDateEnd(2015, 4, 20) }},

    {value: 'с 10 по 20 апреля 2014',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2014, 4, 10), end: UTCDateEnd(2014, 4, 20) }},

    {value: 'Январь-Март',
     options: {now: UTCDate(2015, 6, 9), min: UTCDate(1999, 12, 31), max: UTCDate(2015, 6, 9)},
     out: {start: UTCDate(2015, 1, 1), end: UTCDateEnd(2015, 3, 31) }}

];

testCases.map(function(cs) {
    describe('DateRane', function() {
        it('should correctly parse ' + cs.value, function() {
            var drp = new DateRangeParser('ru');
            var result = drp.parseToDate(cs.value, cs.options);
            if (cs.out == null || result == null) {
                var ok = cs.out == result;
            } else {
                var cmpOUT = {start: cs.out.start? +cs.out.start: '',
                              end: cs.out.end? +cs.out.end: ''};
                var cmpRES = {start: result.start? +result.start: '',
                              end: result.end? +result.end: ''};

                var ok = JSON.stringify(cmpRES) == JSON.stringify(cmpOUT);
            }
            assert.equal(ok, true);
        });
    });
});
