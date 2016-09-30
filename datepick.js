/*jslint esversion: 6, -W097, browser: true */
/* globals jQuery, $ */

import "vendor/iso8601"; // Date.parse
let moment = require("moment");
import {Calendar} from "./calendar";
import {router} from "main";
import {isMobile, isTablet} from "gov/detector"

(function($) {
    'use strict';

    $.fn.zIndex = function(zIndex) {
        if (zIndex !== undefined) {
            return this.css('zIndex', zIndex);
        }

        if (this.length) {
            var elem = $(this[0]), position, value;
            while (elem.length && elem[0] !== document) {
                // Ignore z-index if position is set to a value where z-index is ignored by the browser
                // This makes behavior of this function consistent across browsers
                // WebKit always returns auto if the element is positioned
                position = elem.css('position');
                if (position === 'absolute' || position === 'relative' || position === 'fixed') {
                    // IE returns 0 when zIndex is not specified
                    // other browsers return a string
                    // we ignore the case of nested elements with an explicit value of 0
                    // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                    value = parseInt(elem.css('zIndex'), 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }

        return 0;
    };

    function DatePicker(element, options) {
        this.options = options;
        this.$element = $(element);
        this.isInput = this.$element.is('input');

        var mMin = moment(this.$element.attr('min') || this.$element.data('min'), 'YYYY-MM-DD');
        var mMax = moment(this.$element.attr('max') || this.$element.data('max'), 'YYYY-MM-DD');

        if (mMin.isValid()) {
            this.min = mMin.toDate();
        }
        if (mMax.isValid()) {
            this.max = mMax.toDate();
        }

        this.submitOnChange = !!this.$element.data('submit');

        if (this.isInput) {
            var value = this.$element.val();
            if (value !== ''){
                this.value = moment(value, ['YYYY-MM-DD', 'DD.MM.YYYY']).toDate();
            }
        } else {
            this.value = moment(this.$element.data('value'), ['YYYY-MM-DD', 'DD.MM.YYYY']).toDate();
        }
        //console.log('PARSED VALUE', this.value+'');

        if (!this.min) {
            this.min = moment('1900-01-01').toDate();
        }

        if (!this.max) {
            this.max = moment().toDate();
        }

        this.format = this.$element.data('format') || 'dd.mm.yyyy';
        this.zIndex = this.$element.data('zindex');

        this.isRange = this.$element.data('range');

        this.init();
    }

    DatePicker.prototype.init = function datePickerInitPrototype() {
        var $element = this.$element;
        this.$clearButton = $element.nextAll('.clear_date_filter');

        this.$element.on('click', this.toggle.bind(this));

        this.offset = {x: 0, y: 20};

        var container; // XXX

        // Quickfix - disable native calendar on mobile apps
        //if (isTablet.any() || isMobile.any()) {
        //    var container = document.createElement('div');
        //    container.className = 'calendar-container';
        //    var $currentValue = $('<span "current-value"></span>');
        //    $currentValue.text($element.text());
        //    $element.empty().append($currentValue);
        //    $element.find('input').remove();
        //    $element.append('<input type="date"/>');
        //    var $dateInput = $element.find('input');
        //    $dateInput.attr('min', $element.data('min'));
        //    $dateInput.attr('max', $element.data('max'));
        //    if (this.value) {
        //        $dateInput.val(moment(this.value).format('YYYY-MM-DD'));
        //    }
        //    $dateInput.css({position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0, 'z-index': 10});
        //    $dateInput.on('blur', this.onBlur.bind(this));
        //    return;
        //}

        if (this.value) {
            this.value.setHours(0, 0, 0);
        }

        $(window).on('click.calendar', this.onWindowClick.bind(this));

        var lang = $('html').prop('lang');
        this.calendar = new Calendar(container, lang, this.min, this.max,
                                     {isRange: this.isRange, reversed: !this.isRange});

        if (this.isInput) {
            if (this.$element.prop('type') === 'date') {
                this.$element.prop('type', 'text');
                if (this.value) {
                    this.$element.val(moment(this.value).format(this.format.toUpperCase()));
                }
            }
        }

        var $container = $(this.calendar.container);
        $container.toggleClass('calendar-grey', !!this.$element.data('url'));

        $container.on('render.month', this.onMonthRender.bind(this));
        $container.on('remove.month', this.onMonthRemove.bind(this));
        $container.on('click', this.onContainerClick.bind(this));
        $container.on('select.range', function(e, range) {
            this.selectRange(range);
        }.bind(this));

        this.pendingRequests = {};
        this.datesStore = {};
        this.scheduledDates = {};

        this.$element.unbind('click').click(this.onElementClick.bind(this));

        if (this.calendar) {
            if (this.value) {
                this.calendar.setSelection(this.value);
            } else {
                // XXX What about timezones? Date in easter timezones may not
                // exist in moscow tz.
                this.calendar.fill(new Date());
            }
        }

        if (!this.submitOnChange) { // XXX
            this.$clearButton.on('click', this.onClearClick.bind(this));
        }
    };

    DatePicker.prototype.selectRange = function selectRange(range) {
        if (range && range.start && range.end) {
            this.value = range.end;
            var days = Math.floor((range.end - range.start) /
                                  (1000 * 3600 * 24));

            var startFmt = this.calendar.format(range.start, this.format);
            var endFmt = this.calendar.format(range.end, this.format);

            if (days === 0) {
                this.$element.text(endFmt);
            } else {
                this.$element.text(startFmt + ' – ' + endFmt);
            }

            var formSelector = this.$element.data('form');
            var $form = (formSelector ? $(formSelector) : this.$element.closest('form'));
            var targetSelector = this.$element.data('target');

            if (targetSelector) {
                var tillSelector = targetSelector.replace('since', 'till');

                $form.find(targetSelector).val(startFmt);
                $form.find(tillSelector).val(endFmt);
            } else if (this.isInput) {
                this.$element.val(endFmt);
            } else if (this.value) {
                var dateString = range.end.toISOString();
                this.loadByDate(dateString);
            }

            if (this.submitOnChange) {
                $form.submit();
                this.$element.removeClass('is-active').addClass('is-loading');
            }
            this.$clearButton.removeClass('hidden');

            this.hide();
        }
    };

    DatePicker.prototype.onContainerClick = function(e) {
        var $tgt = $(e.target);
        if ($tgt.closest('.dateblock')) {
            e.stopPropagation();
            e.preventDefault();
        }
        if ($tgt.hasClass('calendar-day') &&
              !$tgt.hasClass('calendar-not-this-month')) {
            var dateString = $tgt.data('datetime');
            var date = new Date(Date.parse(dateString));
            if (this.$element[0] === $tgt[0]) {
                return;
            }
            this.selectRange({start: date, end: date});
        }
    };

    DatePicker.prototype.onMonthRender = function(e) {
        var date;
        if (e.detail) {
            date = e.detail;
        } else {
            date = e.originalEvent.detail;
        }
        var year = date.year();
        var month = date.month()+1;
        var url = this.$element.data('url');
        if (!url) {
            return;
        }
        url = url
            .replace('YEAR', year)
            .replace('MONTH', month);

        var dateString = date.year().toString();
        var yearAndMonthString = dateString + date.month().toString();
        if (this.datesStore.hasOwnProperty(year)) {
            var months = this.datesStore[year+''];
            var dates = months[month];
            if (dates) {
                this.setEnabledDates(date, dates);
            }
        } else {
            this.scheduledDates[yearAndMonthString] = true;
            // No new requests for dateString.
            if (this.pendingRequests.hasOwnProperty(dateString)) {
                return;
            }
            this.pendingRequests[dateString] = $.get(url).done(function(data) {
                var dates;
                if (data && data.dates) {
                    // Months
                    if ($.isArray(data.dates) && data.dates.length > 0) {
                        dates = data.dates;
                        this.setEnabledDates(date, dates);
                    }
                    // Years
                    if ($.isPlainObject(data.dates)) {
                        this.datesStore[year] = data.dates;
                        for (var i in data.dates) {
                            var checkDateString = (year).toString() + (i - 1).toString();
                            if (this.scheduledDates[checkDateString]) {
                                this.setEnabledDates(new Date(year, (i - 1), 1), data.dates[i]);
                                delete this.scheduledDates[checkDateString];
                            }
                        }
                    }
                }
            }.bind(this));
        }
    };

    DatePicker.prototype.onMonthRemove = function(e) {
        var date;
        if (e.detail) {
            date = e.detail;
        } else {
            date = e.originalEvent.detail;
        }
        var dateString = date.year().toString() + date.month().toString();
        var req = this.pendingRequests[dateString];
        if (req) {
            req.abort();
            delete this.pendingRequests[dateString];
        }
    };

    DatePicker.prototype.onElementClick = function(e, data) {
        e.stopPropagation();
        e.preventDefault();

        if (this.isVisible) {
            this.hide();
        } else {
            this.show(data);
        }

        // XXX pickers is global object and it will store
        //     a link to removed DOM until a page reload
        $.each($.fn.datepick.pickers, function(_, item){
            if (item !== this) {
                item.hide();
            }
        }.bind(this));

        //this.calendar.scrollToMonth(this.value);
    };

    DatePicker.prototype.onClearClick = function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.$element.text('');

        var formSelector = this.$element.data('form');
        var $form = (formSelector ? $(formSelector) : this.$element.closest('form'));
        var targetSelector = this.$element.data('target');
        var tillSelector = targetSelector.replace('since', 'till');

        $form.find(targetSelector).val('');
        $form.find(tillSelector).val('');

        this.$clearButton.addClass('hidden');
        this.hide();
        this.$element.focus();
    };

    DatePicker.prototype.toggle = function(e) {
        e.stopPropagation();
    };

    DatePicker.prototype.reposition = function() {
        var $container = $(this.calendar.container);
        var bounds = this.$element.get(0).getBoundingClientRect();
        $container.css({
            position: 'fixed',
            left: bounds.left + this.$element.outerWidth() / 2 - $container.outerWidth() / 2 + this.offset.x,
            top: bounds.top + this.$element.outerHeight() + this.offset.y,
            zIndex: this.zIndex //|| this.$element.zIndex()
            // TODO
            // почему функция так странно работает? не совсем понятно, что хотелось получить
        });
    };

    DatePicker.prototype.show = function(options) {
        if (this.isVisible) {
            return;
        }
        var $container = $(this.calendar.container);
        $(document.body).append($container);
        $container.show();
        this.$element.addClass('is-active');
        var self = this;
        $(window).bind('scroll.picker', function() {
            self.reposition();
        });
        $(window).bind('resize.picker', debounce(function() {
            self.reposition();
        }, 300));
        this.reposition();
        if (this.value) {
            this.calendar.setSelection(this.value);
        } else {
            var date = new Date();
            this.calendar.fill(date);
            this.calendar.setSelection(date);
        }
        this.calendar.isVisible = true;
        this.isVisible = true;

        if (options && options.shouldFocusOnInput) {
            this.calendar.renderYearsDropdown();
            this.calendar.renderInput();
            $(this.calendar.dateInput).removeAttr('aria-hidden').focus();
        } else {
            $(this.calendar.accessibleInput).focus();
        }
    };

    DatePicker.prototype.hide = function() {
        if (!this.isVisible) {
            return;
        }
        if ($(this.calendar.container).find(':focus').length) {
            this.$element.focus();
        }

        this.$element.removeClass('is-active');
        $(this.calendar.container).hide();
        $(window).unbind('scroll.picker');
        $(window).unbind('resize.picker');
        this.calendar.isVisible = false;
        this.isVisible = false;
        this.$element.trigger('hide');
    };

    DatePicker.prototype.setValue = function(date) {
        var targetSelector = this.$element.data('target');
        date.setHours(0, 0, 0);
        this.value = date;
        if (this.calendar) {
            this.calendar.setSelection(this.value);
        }
        if (targetSelector) {
            $(targetSelector).val(moment(date).format('DD.MM.YYYY'));
        } else {
            var currentText = this.$element.text();
            var text = moment(date).format(this.format.toUpperCase());
            if (currentText !== text) {
                if (isTablet.any() || isMobile.any()) {
                    this.$element.find('.current-value').text(text);
                } else {
                    this.$element.text(text);
                }
            }
            if (this.isInput && this.$element.prop('type') === 'date') {
                this.$element.val(moment(date).format('YYYY-MM-DD'));
            } else {
                this.$element.val(moment(date).format('DD.MM.YYYY'));
            }
        }
    };

    DatePicker.prototype.setEnabledDate = function(date, day) {
        if (this.calendar) {
            date = this.calendar.unifiedDate(date).clone().date(day);
            var cell = this.calendar.getDateCell(date);
            if (cell) {
                $(cell).addClass('enabled');
            }
        }
    };

    DatePicker.prototype.setEnabledDates = function(date, dates) {
        for (var i = 0; i < dates.length; i++) {
            this.setEnabledDate(date, dates[i]);
        }
    };

    DatePicker.prototype.loadByDate = function(dateString) {
        var date = new Date(Date.parse(dateString));
        var dateForUrl = moment(date).format('DD.MM.YYYY');
        var url = this.$element.data('date-url');
        if (url) {
            url = url.replace('DATE', dateForUrl);
        }

        this.$element.text(moment(date).format('MMMM, YYYY'));
        router.one('loaded.by-date', function() {
            router.off('loaded.by-date');
            this.$element.removeClass('is-loading');
        }.bind(this));
        this.$element.addClass('is-loading');
        router.handleURL(url);
    };

    DatePicker.prototype.onBlur = function() {
        var targetSelector = this.$element.data('target');
        if (targetSelector) {
            var date = new Date($dateInput.val());
            $(targetSelector).val(moment(date).format('DD.MM.YYYY'));
            this.$element.find('.current-value').text(moment(date).format('DD.MM.YYYY'));

            if (this.submitOnChange) {
                $('.search_results').find('form').submit();
                this.$element.removeClass('is-active');
                this.$element.addClass('is-loading');
            }
        } else {
            this.loadByDate($dateInput.val());
        }
    };

    DatePicker.prototype.onWindowClick = function(e) {
       if ($(e.target).closest('.calendar-container').length <= 0) {
           this.$element.removeClass('is-active');
           this.hide();
       }
    };

    DatePicker.prototype.destroy = function() {
        this.hide();
        if (this.calendar) {
            $(this.calendar.container).detach();
            this.calendar = null;
        }
    };

    function zeroPad(num, places) {
        var zero = places - num.toString().length + 1;
        return Array(+(zero > 0 && zero)).join('0') + num;
    }

    $.fn.datepick = function jQueryFnDatePick(option) {
        this.each(function() {
            var $this = $(this);
            var data = $this.data('datepick');
            var options = typeof option === 'object' && option;

            if (!data) {
                var picker = new DatePicker(this, options);
                $.fn.datepick.pickers.push(picker);
                $this.data('datepick', (data = picker));
            }
        });
    };

    $.fn.datepick.pickers = [];
})(jQuery);
