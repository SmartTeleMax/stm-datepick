/* jslint esversion: 6, -W097, browser: true, strict: implied, -W034 */
/* globals $:true, jQuery:true, console: true, currentLanguage, require */

let moment = require("moment");

(function() {
    var DAY = 1000 * 60 * 60 * 24;

    var locale = {
        ru: {
            lettersRange: 'а-яё',
            matcher: /^([а-яё ]+)$|^([ 0-9:-]+)$|^([ 0-9:\\.]+)$|^(\d+[а-яё]+)$/,
            dayMatcher: /(\d+)\s*([а-яё]+)/i,
            fullDateMatcher: /(\d{1,2})\s*([а-яё ]+)\s*(\d{2,4})/i,
            momentFormats: [
                "DD-MM-YYYY",
                "YYYY-MM-DD",
                "DD.MM.YYYY",
                "DD.MM.YY",
                "DD MMM YYYY",
                "DD MMMM YYYY",
                "D MMM YYYY",
                "D MMMM YYYY",
                "MMM YYYY",
                "MMMM YYYY",
                "DD MMM",
                "DD MMMM",
                "D MMM",
                "D MMMM",
                "MMM YY",
                "MMMM YY",
                "До DD.MM.YYYY",
                "MMM",
                "MMMM"
            ],
            rangeMatchers: [
                /с\s*([\d\wа-яА-ЯёЁ .-]+)\s*по\s*([\d\wа-яА-ЯёЁ .-]+)/,
                /([\dа-я.-]+)\s*(?:[-—])\s*([\dа-я.-]+)/i
            ],
            alias: {
                "yr": "г,год,года,лет",
                "mon": "ме,мес,месяц,месяцев",
                "day": "д,де,дн,день,дней",
                "hr": "ч,ча,час,часа,часов",
                "min": "м,мин,минута,минут",
                "sec": "с,сек,секунд,секунда"
            },
            common: {
                "now": "сейчас",
                "today": "сегодня",
                "thisweek": "нанеделе",
                "lastweek": "занеделю",
                "thismonth": "вэтоммесяце",
                "thisyear": "вэтомгоду",
                "yesterday": "вчера",
                "beforeyesterday": "позавчера",
                "pastweek": "напрошлойнеделе",
                "lastmonth": "впрошломмесяце",
                "lastyear": "впрошломгоду",
                "tomorrow": "завтра",
                "nextweek": "наследующейнеделе",
                "nextmonth": "вследующеммесяце",
                "nextyear": "наследующемгоду"
            }
        },
        en: {
            lettersRange: 'a-z',
            matcher: /^([a-z ]+)$|^([ 0-9:-\\.]+)$|^(\d+[a-z]+)$/,
            dayMatcher: /(\d+)\s*([a-z]+)/i,
            fullDateMatcher: /(\d{1,2})\s*([а-яё ]+)\s*(\d{2,4})/i,
            momentFormats: [
                "DD-MM-YYYY",
                "YYYY-MM-DD",
                "DD.MM.YYYY",
                "DD.MM.YY",
                "DD MMM YYYY",
                "DD MMMM YYYY",
                "D MMM YYYY",
                "D MMMM YYYY",
                "MMM YYYY",
                "MMMM YYYY",
                "DD MMM",
                "DD MMMM",
                "D MMM",
                "D MMMM",
                "MMM YY",
                "MMMM YY",
                "Before DD.MM.YYYY",
                "MMM",
                "MMMM"
            ],
            rangeMatchers: [
                /^from\s*([\d\w.-]+)\s*to\s*([\d\w.-]+)$/,
                /^([\d\w.-]+)\s*(?:[-—])\s*([\d\w.-]+)$/
            ],
            alias: {
                "yr": "y,yr,yrs,year,years",
                "mon": "mo,mon,mos,mons,month,months",
                "day": "d,dy,dys,day,days",
                "hr": "h,hr,hrs,hour,hours",
                "min": "m,min,mins,minute,minutes",
                "sec": "s,sec,secs,second,seconds"
            },
            common: {
                "now": "now",
                "today": "today",
                "thisweek": "thisweek",
                "lastweek": "lastweek",
                "thismonth": "thismonth",
                "thisyear": "thisyear",
                "yesterday": "yesterday",
                "beforeyesterday": "beforeyesterday",
                "pastweek": "pastweek",
                "lastmonth": "lastmonth",
                "lastyear": "lastyear",
                "tomorrow": "tomorrow",
                "nextweek": "nextweek",
                "nextmonth": "nextmonth",
                "nextyear": "nextyear"
            }
        }
    };

    var loc = locale[currentLanguage];

    var drp = window.dateRangeParser = {};

    drp.defaultRange = 1000 * 60 * 60 * 24;

    drp.now = null; // set a different value for now than the time at function invocation


    //drp.printDate = function(t, p) {
    //    var format = ["", "-", "-", " ", ":", ":", "."];
    //    var da = makeArray(t);
    //    var str = "";
    //    for (var i = 0; i <= p; i++) {
    //        str += format[i] + (da[i] < 10 ? "0" : "") + da[i];
    //    }
    //    return str;
    //};

    //drp.parseNumber = function(v) {
    //    try {
    //        var r = drp._parseNumber(v);
    //    } catch (e) {
    //        r = null;
    //    }
    //    return r;
    //};

    (function() {
        drp._relTokens = {};

        var values = {
            "yr": 365 * 24 * 60 * 60 * 1000,
            "mon": 31 * 24 * 60 * 60 * 1000,
            "day": 24 * 60 * 60 * 1000,
            "hr": 60 * 60 * 1000,
            "min": 60 * 1000,
            "sec": 1000
        };
        //values[loc.values.yr] = 365 * 24 * 60 * 60 * 1000;
        //values[loc.values.mon] = 31 * 24 * 60 * 60 * 1000;
        //values[loc.values.day] = 24 * 60 * 60 * 1000;
        //values[loc.values.hr] = 60 * 60 * 1000;
        //values[loc.values.min] = 60 * 1000;
        //values[loc.values.sec] = 1000;

        var alias_lu = loc.alias;

        for (var key in alias_lu) {
            if (alias_lu.hasOwnProperty(key)) {
                var aliases = alias_lu[key].split(",");
                for (var i = 0; i < aliases.length; i++) {
                    drp._relTokens[aliases[i]] = values[key];
                }
            }
        }
    })();

    // create an array of date components from a Date
    function makeArray(d) {
        var da = new Date(d);
        return [da.getUTCFullYear(), da.getUTCMonth() + 1, da.getUTCDate(), 0, 0, 0, 0];
    }

    // convert an array of date components into a Date
    function fromArray(a) {
        var d = [].concat(a);
        d[1]--;
        return Date.UTC.apply(null, d);
    }

    // create an array of date components with all entried with less significance than p (precision) zeroed out.
    // an optional offset can be added to p
    function precArray(d, p, offset) {
        var tn = makeArray(d);
        tn[p] += offset || 0;
        for (var i = p + 1; i < 7; i++) {
            tn[i] = i < 3 ? 1 : 0;
        }
        return tn;
    }

    // create a range based on a precision and offset by the range amount
    function makePrecRange(dt, p, r) {
        var ret = {};
        ret.start = fromArray(dt);
        var dte = Array.prototype.slice.call(dt);
        dte[p] += (r || 1);
        ret.end = fromArray(dte);
        ret.end = moment.utc(ret.end).add(-1, 'day').toDate();
        return ret;
    }

    function getRange(op, term1, term2, origin) {
        if (!term1 && !term2) {
            return {};
        }
        if (op === "<" || op === "->" || op === "-") {
            if (term1 && !term2) {
                return {start: term1.start, end: null};
            } else if (!term1 && term2) {
                return {start: null, end: term2.end};
            } else {
                if (term2.rel) {
                    return {start: term1.start, end: term1.end + term2.rel};
                } else if (term1.rel) {
                    return {start: term2.start - term1.rel, end: term2.end};
                } else {
                    return {start: term1.start, end: term2.end};
                }
            }
        } else if (op === "<>") {
            // XXX what is this?!
            if (!term2) {
                return {start: term1.start - drp.defaultRange, end: term1.end + drp.defaultRange};
            } else {
                if (!("rel" in term2)) throw "second term did not have a range";
                return {start: term1.start - term2.rel, end: term1.end + term2.rel};
            }
        } else if (term1) {
            if (term1.rel) {
                return {start: origin - term1.rel, end: origin + term1.rel};
            } else if (term1.now) {
                return {start: term1.now - drp.defaultRange, end: term1.now + drp.defaultRange};
            } else {
                return {start: term1.start, end: term1.end};
            }
        }
        return {};
    }

    function checkSymbol(m, symbol) {
        var re = new RegExp('(?:^|\\W)' +symbol+ '+(?:$|\\W)');
        return !!m._f.match(re);
    }

    function allowedSubrange(range, options) {
        if (options.min && range) {
            if (options.min.isAfter(range.start)){
                range.start = options.min.clone();
            }
        }
        if (options.max && range){
            if (options.max.isBefore(range.end)) {
                range.end = options.max.clone().toDate();
            }
        }
        if (+range.end < +range.start) {return null; }
        return range;
    }

    function processTerm(term, origin, options) {
        term = $.trim(term);

        var moment_ = moment.utc(term, loc.momentFormats, true);
        if (moment_.isValid()) {
            var f = moment_._f;
            if (!checkSymbol(moment_, 'Y')) {
                // If the year is not set and the month is in future,
                // set month from current year
                if (options.now) {
                    moment_.year(moment.utc(+options.now).year());
                }
                if (moment_.clone().startOf('month').isAfter(options.now)) {
                    moment_.subtract(1, 'year');

                }
            }

            var parsedDate = moment_.toDate();
            var p = 0;
            if (checkSymbol(moment_, 'M')) { p = 1; } // format contains a month
            if (checkSymbol(moment_, 'D')) { p = 2; } // format contains a day
            var dt = precArray(parsedDate, p);

            var range = makePrecRange(dt, p);
            return allowedSubrange(range, options);
        }

        var m = term.replace(/\s/g, "").toLowerCase().match(locale[currentLanguage].matcher);

        if (!m) { return; }

        if (m[1]) {	// matches ([a-z ]+)
            function dra(p, o, r, start) {
                // p - precision
                // o - start offset
                // r - range length
                start = start || moment.utc(origin).toDate();
                var dt = precArray(origin, p, o);

                var range = makePrecRange(dt, p, r);
                return allowedSubrange(range, options);
            }

            var weekstart;
            switch (m[1]) {
                case loc.common.now :
                    return {start: origin, end: origin, now: origin};
                case loc.common.today:
                    return dra(2, 0);
                case loc.common.thisweek:
                    weekstart = moment.utc(origin).startOf('week').toDate();
                    return dra(2, 0, 7, weekstart);
                case loc.common.lastweek:
                    return dra(2, -6, 7);
                case loc.common.thismonth:
                    return dra(1, 0);
                case loc.common.thisyear:
                    return dra(0, 0);
                case loc.common.yesterday:
                    return dra(2, -1);
                case loc.common.beforeyesterday:
                    return dra(2, -2);
                case loc.common.pastweek:
                    weekstart = moment.utc(origin).startOf('week').toDate();
                    return dra(2, -8, 7, weekstart);
                case loc.common.lastmonth:
                    return dra(1, -1);
                case loc.common.lastyear:
                    return dra(0, -1);
                case loc.common.tomorrow:
                    return dra(2, 1);
                case loc.common.nextweek:
                    return dra(2, 7, 7);
                case loc.common.nextmonth:
                    return dra(1, 1);
                case loc.common.nextyear:
                    return dra(0, 1);
            }
            console && console.log && console.log("unknown token", m[1]); // jshint ignore:line
            return null;

        } else if (m[2]) { // matches ([ 0-9:-]+)
            var dn = makeArray(origin);
            var dt = m[2].match(/^(?:(\d{4})(?:\-(\d\d))?(?:\-(\d\d))?)? ?(?:(\d{1,2})(?:\:(\d\d)(?:\:(\d\d))?)?)?$/);
            if (!dt) { return null; }
            dt.shift();
            for (var p = 0, z = false, i = 0; i < 7; i++) {
                if (dt[i]) {
                    dn[i] = parseInt(dt[i], 10);
                    p = i;
                    z = true;
                } else {
                    if (z)
                        dn[i] = i < 3 ? 1 : 0;
                }
            }
            var range = makePrecRange(dn, p);
            return allowedSubrange(range, options);
        } else if (m[3]) { // matches ([ 0-9:.]+)
            var dn = makeArray(origin);
            var dt = m[3].match(/^(?:(\d\d))(?:\.(\d\d))?(?:\.(\d{4})?)? ?(?:(\d{1,2})(?:\:(\d\d)(?:\:(\d\d))?)?)?$/);
            if (dt === null) { return null; }
            dt.shift();
            dn[0] = dt[2];
            dn[1] = dt[1];
            dn[2] = dt[0];
            var range = makePrecRange(dn, 3);
            return allowedSubrange(range, options);
        } else if (m[4]) { // matches (\d+[a-z]{1,4})
            var dr = m[4].match(loc.dayMatcher);
            var n = parseInt(dr[1], 10);
            return {rel: n * drp._relTokens[dr[2]]};
        }
        console && console.log && console.log("unknown term", term);
        return null;
    }

    drp.unifiedDate = function unifiedDate(date) {
        if (typeof date == 'number') {
            date = moment.utc(date);
        } else if (date instanceof Date) {
            date = moment.utc([date.getFullYear(), date.getMonth(), date.getDate()]);
        } // XXX UTC or not?!
        return date;
    };

    drp.parse = function parseDateRange(v, options) {
        options = options || {};
        if (options.max) { options.max = drp.unifiedDate(options.max); }
        if (options.min) { options.min = drp.unifiedDate(options.min); }
        var now = options.now || this.now || new Date().getTime();

        if (!v) {
            return {start: null, end: null};
        }

        for (var i = 0; i < loc.rangeMatchers.length; i++) {
            v = v.replace(loc.rangeMatchers[i], '$1 -> $2');
        }

        if (v.match(/\d\s*(-|–|—)\s*\d/)) {
            v = v.replace(/(-|–|—)/, '->');
        }

        var terms = (' '.split(/\s+/)[1] ?
                         v.split(/\s*([^<>]*[^<>-])?\s*(->|<>|<)?\s*([^<>]+)?\s*/) :
                         // native implementation is not supported by IE8
                         split(v, /\s*([^<>]*[^<>-])?\s*(->|<>|<)?\s*([^<>]+)?\s*/));

        var term1 = terms[1] ? processTerm(terms[1], now, options) : null;
        var op = terms[2] || "";
        var term2 = terms[3] ? processTerm(terms[3], now, options) : null;

        if (term2 && term2.end && !term1 && /^\d+$/.test($.trim(terms[1])) && /\d+/.test($.trim(terms[3]))) {
            // 25 - 26 января
            term1 = {start: moment.utc(term2.end).clone().date(+terms[1]).toDate()};
            term1.end = term1.start;
        }

        var r = getRange(op, term1, term2, now);
        //r.end && r.end--; // remove 1 millisecond from the final end range
        return r;
    };

    drp.parseToDate = function(v, options){
        var range = drp.parse(v, options);
        if (!range) { return null; }

        var out = {};
        if (range.start) { out.start = new Date(range.start); }
        if (range.end) { out.end = new Date(range.end); }
        return out;
    };


    // http://stackoverflow.com/questions/1453521/javascript-split-doesnt-work-in-ie
    var nativeSplit = String.prototype.split,
        compliantExecNpcg = /()??/.exec("")[1] === undefined; // NPCG: nonparticipating capturing group
    function split (str, separator, limit) {
        // If `separator` is not a regex, use `nativeSplit`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
            return nativeSplit.call(str, separator, limit);
        }
        var output = [],
            flags = (separator.ignoreCase ? "i" : "") +
                    (separator.multiline  ? "m" : "") +
                    (separator.extended   ? "x" : "") + // Proposed for ES6
                    (separator.sticky     ? "y" : ""), // Firefox 3+
            lastLastIndex = 0,
            // Make `global` and avoid `lastIndex` issues by working with a copy
            separator = new RegExp(separator.source, flags + "g"),
            separator2, match, lastIndex, lastLength;
        str += ""; // Type-convert
        if (!compliantExecNpcg) {
            // Doesn't need flags gy, but they don't hurt
            separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = limit === undefined ?
            -1 >>> 0 : // Math.pow(2, 32) - 1
            limit >>> 0; // ToUint32(limit)
        while (match = separator.exec(str)) {
            // `separator.lastIndex` is not reliable cross-browser
            lastIndex = match.index + match[0].length;
            if (lastIndex > lastLastIndex) {
                output.push(str.slice(lastLastIndex, match.index));
                // Fix browsers whose `exec` methods don't consistently return `undefined` for
                // nonparticipating capturing groups
                if (!compliantExecNpcg && match.length > 1) {
                    match[0].replace(separator2, function () {
                        for (var i = 1; i < arguments.length - 2; i++) {
                            if (arguments[i] === undefined) {
                                match[i] = undefined;
                            }
                        }
                    });
                }
                if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(output, match.slice(1));
                }
                lastLength = match[0].length;
                lastLastIndex = lastIndex;
                if (output.length >= limit) {
                    break;
                }
            }
            if (separator.lastIndex === match.index) {
                separator.lastIndex++; // Avoid an infinite loop
            }
        }
        if (lastLastIndex === str.length) {
            if (lastLength || !separator.test("")) {
                output.push("");
            }
        } else {
            output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
    }


    //drp._parseNumber = function parseNumber(v) {
    //    var origin = this.origin || 0;
    //    if (!v) {
    //        return {start: null, end: null};
    //    }
    //    var terms = v.split(/\s*(-?[0-9.eE]+)?\s*(->|<>|<)?\s*(-?[0-9.eE]+)?\s*/);
    //    var term1 = terms[1] ? parseFloat(terms[1]) : null;
    //    var op = terms[2] || "";
    //    var term2 = terms[3] ? parseFloat(terms[3]) : null;

    //    return getRange(op, {start: term1, end: term1}, {
    //        start: term2,
    //        end: term2,
    //        rel: (op === "<>" ? term2 : undefined)
    //    }, origin);
    //}


    function UTCDate(year, month, day) {
        return new Date(Date.UTC(year, month-1, day, 0, 0, 0, 0));
    }
    function UTCDateEnd(year, month, day) {
        return new Date(+UTCDate(year, month, day));// + msDay - 1);
    }

    window.UTCDate = UTCDate;
    

    drp.testCases = [
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

    drp.runTests = function(){
        var okTotal=0, failedTotal = 0;
        for (var i=0; i < drp.testCases.length; i++){
            var cs = drp.testCases[i];
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
            if (!ok){
                var level = ok? 'log': 'warn';
                console[level]('Test case:',
                               '\n    value   ', cs.value,
                               '\n    options ', cs.options,
                               '\n    expected', cs.out,
                               '\n    result  ', result);
            }
            failedTotal += !ok;
            okTotal += !!ok;
        }
        console.log('Tests runned', drp.testCases.length, ' OK: ', okTotal, 'FAILED: ', failedTotal);
    };

})();
