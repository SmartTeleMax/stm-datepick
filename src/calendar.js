/* jslint esversion: 6, -W097, browser: true */
/* globals console, require */

'use strict';

require('core-js/es5');
var $ = require('jquery');
var moment = require("moment");
import "moment/locale/ru";
import {unifiedDate, DateRangeParser} from "./date_range_parser";
import {DateRange} from "./date_range";



var locales = {
    en: {
        monthNames: [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'],
        dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        shortWeekDayNames: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        placeholder: 'Enter date',
        //momentFormats: [
        //    "DD-MM-YYYY",
        //    "YYYY-MM-DD",
        //    "DD.MM.YYYY",
        //    "DD.MM.YY",
        //    "DD MMM YYYY",
        //    "DD MMMM YYYY",
        //    "D MMM YYYY",
        //    "D MMMM YYYY",
        //    "MMM YYYY",
        //    "MMMM YYYY",
        //    "DD MMM",
        //    "DD MMMM",
        //    "D MMM",
        //    "D MMMM",
        //    "MMM YY",
        //    "MMMM YY",
        //    "Before DD.MM.YYYY",
        //    "MMM",
        //    "MMMM"
        //],
        help: [

            "Specify the desired date. After filling the fields, press Enter. Examples" +
            " of how you can set the date.",
            'Examples',
            '26 January 2015',
            '26.01.2015',
            //'March-April',
            'January 2015',
            'yesterday'
        ],
        //rangeMatchers: [
        //    /from\s*([\d\w.-]+)\s*to\s*([\d\w.-]+)/,
        //    /([\d\w.-]+)\s*(?:[-—])\s*([\d\w.-]+)/
        //],
        rangeHelp: [
            "Specify the desired date. After filling the fields, press Enter. Examples" +
            " of how you can set the date and time periods.",
            'Examples',
            '26 January 2015',
            '26.01.2015',
            '26.01.2015 - 12.02.2015',
            'January-February',
            'January 2015',
            'yesterday'
        ],
        errors: {
            dateInFuture: 'Invalid date.',
            dateNotParsed: 'Invalid date.'
            //dateInFuture: "Date in the future is not permitted.",
            //dateNotParsed: "Date can not be recognized."
        }
    },

    ru: {
        monthNames: [
            'Январь', 'Февраль', 'Март', 'Апрель',
            'Май', 'Июнь', 'Июль', 'Август',
            'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        dayNames: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        shortWeekDayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        //momentFormats: [
        //    "DD-MM-YYYY",
        //    "YYYY-MM-DD",
        //    "DD.MM.YYYY",
        //    "DD.MM.YY",
        //    "DD MMM YYYY",
        //    "DD MMMM YYYY",
        //    "D MMM YYYY",
        //    "D MMMM YYYY",
        //    "MMM YYYY",
        //    "MMMM YYYY",
        //    "DD MMM",
        //    "DD MMMM",
        //    "D MMM",
        //    "D MMMM",
        //    "MMM YY",
        //    "MMMM YY",
        //    "До DD.MM.YYYY",
        //    "MMM",
        //    "MMMM"
        //],
        placeholder: 'Поиск по дате',
        help: [
            'Укажите интересующую вас дату. После заполнения поля нажмите клавишу "Enter".' +
            ' Несколько примеров того, как можно задать дату, приведены ниже.',
            'Примеры',
            '26 января 2015',
            '26.01.2015',
            'Январь 2015'//,
            //'До 26.01.2015'
        ],
        //rangeMatchers: [
        //    /с\s*([\d\w.-]+)\s*по\s*([\d\w.-]+)/,
        //    /([\dа-я.-]+)\s*(?:[-—])\s*([\dа-я.-]+)/i
        //],
        rangeHelp: [
            'Укажите интересующую вас дату. После заполнения поля нажмите клавишу "Enter".' +
            ' Несколько примеров того, как можно задать дату и период времени, приведены ниже.',
            'Примеры',
            '26 января 2015',
            '26.01.2015',
            '26.01.2015 - 12.02.2015',
            'Январь-Март',
            'Январь 2015',
            'вчера'
        ],
        errors: {
            dateInFuture: 'Неправильно указана дата.',
            dateNotParsed: 'Неправильно указана дата.'
            //dateInFuture: 'Дата в будущем не допустима.',
            //dateNotParsed: 'Дата не может быть распознана.'
        }
    }
};


export class Calendar {
    constructor(container, locale, min, max, options) {
        if (locale) {
            this.localize(locale);
        } else {
            this.localize('en');
        }

        this.min = unifiedDate(min);
        this.max = unifiedDate(max);
        this.options = options;
        this.classes = options.classes || {
            row: 'calendar-row',
            header: 'calendar-header',
            day: 'calendar-day',
            today: 'calendar-today',
            input: 'calendar-input-date'
        };

        this.direction = 'down';

        container = document.createElement('div');
        container.className = 'calendar-container';

        this.container = container;

        this.wrapperDate = document.createElement('div');
        this.wrapperDate.className = 'calendar-wrapper-date';
        this.container.appendChild(this.wrapperDate);

        this.container.appendChild(this.renderHeader());
        this.scrollContainer = document.createElement('div');
        this.scrollContainer.className = 'scroll-view calendar-scroll-view';
        this.scrollContainer.setAttribute('aria-hidden', 'true');
        this.container.appendChild(this.scrollContainer);

        this.table = document.createElement('div');
        this.table.className = '_table';
        this.body = document.createElement('div');
        this.body.className = 'body';
        this.table.appendChild(this.body);
        this.scrollContainer.appendChild(this.table);



        this.renderYearsDropdown();
        this.renderInput();

        this.boundEvents = {
            mouseMove: this.onMouseMove.bind(this),
            mouseLeave: this.onMouseLeave.bind(this),
            mouseScroll: this.onMouseScroll.bind(this),
            mouseWheel: this.onMouseWheel.bind(this),
            click: this.click.bind(this)
        };
        $(this.container).bind('click', this.boundEvents.click);

        $(this.container).bind('mousemove', this.boundEvents.mouseMove);
        $(this.container).bind('mouseleave', this.boundEvents.mouseLeave);
        $(this.container).bind('mousewheel', this.boundEvents.mouseWheel);

        $(this.container).bind('mousedown.calendar', function(e) {
            this.lastEventTime = e.timeStamp;
            this.hasMouseDown = true;
        }.bind(this));
        $(document.body).bind('mouseup.calendar', function() {
            // XXX possible memory leak
            if (this.isVisible && this.hasMouseDown) {
                this.hasMouseDown = false;
                this.onMouseScroll();
            }
        }.bind(this));

        $(this.scrollContainer).bind('scroll', this.boundEvents.mouseScroll);

        this.date = moment.utc().startOf('day');

        this.monthHeaderMap = {};
        this.rowsMap = {};

        this.monthSpan = 4;
        this.monthsRendered = 0;
        this.renderedRange = new DateRange();
        this.dateRangeParser = new DateRangeParser(this.locale);
    }

    localize(locale) {
        moment.locale(locale);
        this.locale = locale;
        var strings = locales[locale] || locales.en;
        for (var i in strings) {
            if (strings.hasOwnProperty(i)) {
                this[i] = strings[i];
            }
        }
    }

    daysInMonth(date) {
        return moment.utc(date).endOf('month').date();
    }

    firstDayOfWeek(date) {
        return date.clone().startOf('week');
    }

    isToday(date) {
        // today is TZ datetime, date is day start in UTC
        // we can not just compare them
        var today = moment();
        return today.year() == date.year() && 
               today.month() == date.month() && 
               today.date() == date.date();
    }

    nearTheEdge() {
        var scrollTop = this.scrollContainer.scrollTop;
        var scrollHeight = this.scrollContainer.scrollHeight;
        var height = this.scrollContainer.offsetHeight;
        var toTop = 0 + scrollTop;
        var toBottom = 0 + scrollHeight - scrollTop - height;
        var edge = 100;
        return {
            top: toTop - edge < 0,
            bottom: toBottom - edge < 0
        };
    }

    onMouseMove(e) {
        if ($(e.target).hasClass(this.classes.day)) {
            var dateString = $(e.target).data('datetime');
            var date = new Date(dateString);
            this.highLightWeekDay(date.getDay());
        }
    }

    onMouseLeave() {
        this.unhighLightWeekDays();
    }

    onMouseWheel(e, delta, deltaX, deltaY) {
        var scrollTop = $(this.scrollContainer).prop('scrollTop');
        var maxScroll = $(this.scrollContainer).prop('scrollHeight') - $(this.scrollContainer).outerHeight();
        var self = this;

        if ((deltaY > 0 && scrollTop === 0) || (deltaY < 0 && scrollTop === maxScroll)) {
            e.preventDefault();
            this.onMouseScroll(e);
        }

        if (!$(this.container).find('.calendar-wrapper-date').is('.is-active-input') &&
            !$(this.container).find('.dropdown').is('.opened')) {
            $('.calendar-wrapper-date').toggleClass('closed', this.direction === 'down');
        }
    }

    onMouseScroll() {
        if (this.doNotListenScrolling) {
            return;
        }

        if (this.hasMouseDown) {
            return;
        }

        var scrollable = this.scrollContainer;
        var scrollTop = scrollable.scrollTop;

        if (scrollTop === 0) {
            this.renderPrev();
        }
        if (scrollable.scrollHeight - scrollable.scrollTop - scrollable.offsetHeight === 0) {
            this.renderNext();
        }
        this._lastScrollTop = scrollTop;

        for (var _ in this.monthHeaderMap) {
            if (this.monthHeaderMap.hasOwnProperty(_)) {
                var header = this.monthHeaderMap[_];
                if (scrollTop - Math.abs($(header).position().top) > 0) {
                    var date = moment.utc([parseInt($(header).data('year'), 10),
                                           parseInt($(header).data('month'), 10),
                                           1]);
                    this.updateDropdownValue(date);
                    break;
                }
            }
        }
    }

    click() {
        // No need to select anything right now.
    //         if (e.target.classList.contains(this.classes.day)) {
    //             e.target.classList.add('active');
    //         }
        if (this.dropDown) {
            this.hideYearDropdownList();
        }
    }

    renderYearsDropdown() {
        if (this.yearDropdownRendered) {
            return;
        }
        var dropDownContainer = document.createElement('div');
        dropDownContainer.className = 'calendar-year-dropdown';
        dropDownContainer.setAttribute('aria-hidden', 'true');
        var dropDown = document.createElement('div');
        dropDown.className = 'dropdown';
        var dropDownCurrentValue = document.createElement('div');
        dropDownCurrentValue.className = 'current-value';
        var dropDownList = document.createElement('ul');
        dropDownList.className = 'dropdown_list';
        var select = document.createElement('select');
        var value, i;
        var startYear = this.min.year();
        var endYear = this.max.year();
        // XXX hack for IE8
        startYear = startYear < 1900? startYear + 1900: startYear;
        endYear = endYear < 1900? endYear + 1900: endYear;
        for (i = endYear - startYear; i >= 0; i--) {
            value = startYear + i;

            var listItem = document.createElement('li');
            listItem.innerHTML = value;
            listItem.className = 'list-item';
            if (startYear === value) {
                $(listItem).addClass('current');
                listItem.setAttribute('aria-selected', 'true');
            }
            listItem.value = value;
            listItem.setAttribute('role', 'menuitem');
            dropDownList.appendChild(listItem);

    //             option = document.createElement('option');
    //             option.textContent = value;
    //             option.value = value;
    //             select.appendChild(option);
        }
        // $(dropDownList).css('max-height', $(this.container).outerHeight() / 1.5);
        dropDownCurrentValue.innerHTML = endYear;
        dropDown.appendChild(dropDownCurrentValue);
        dropDown.appendChild(dropDownList);
        dropDownContainer.appendChild(dropDown);

    //         dropDownContainer.appendChild(select);
        var self = this;
        $(dropDownList).on('mousewheel', function(e, delta, deltaX, deltaY) {
            var scrollTop = $(dropDownList).prop('scrollTop');
            var maxScroll = $(dropDownList).prop('scrollHeight') - $(dropDownList).outerHeight();
            if ((deltaY > 0 && scrollTop === 0) || (deltaY < 0 && scrollTop === maxScroll)) {
                e.preventDefault();
            }
        });
        $(dropDown).on('click', function(e) {
            e.stopPropagation();
            if ($(dropDown).hasClass('opened') && !$(e.target).hasClass('dropdown_list') && !$(e.target).hasClass('list-item')) {
                self.hideYearDropdownList();
            } else {
                self.showYearDropdownList();
                if ($(e.target).hasClass('list-item') && !$(e.target).hasClass('current')) {
                    self.onYearDropdownChange(e);
                    for (var i = 0; i < dropDownList.childNodes.length; i++) {
                        $(dropDownList.childNodes[i]).removeClass('current');
                    }
                    $(e.target).addClass('current');
                    dropDownCurrentValue.innerHTML = e.target.value;
                    self.hideYearDropdownList();
                }
            }
        });

        this.dropDown = dropDown;
        this.dropDownCurrentValue = dropDownCurrentValue;
        this.dropDownList = dropDownList;

        $(this.wrapperDate).prepend(dropDownContainer);
    //         select.addEventListener('change', this.onYearDropdownChange.bind(this), false);
    //        setTimeout(function() {
    //            $(dropDownContainer).removeClass('closed');
    //        }, 500);

        this.yearDropdownRendered = true;
    }

    showYearDropdownList() {
        $(this.dropDown).addClass('opened');
        $(this.wrapperDate).addClass('is-active-dropdown');
        this.dropDownList.style.display = 'block';
    }

    hideYearDropdownList() {
        $(this.dropDown).removeClass('opened');
        $(this.wrapperDate).removeClass('is-active-dropdown');
        this.dropDownList.style.display = 'none';
    }

    onYearDropdownChange(e) {
        var year = parseInt(e.target.value, 10);
        this.doNotListenScrolling = true;
        this.empty();
        var date = this.renderedRange.start.clone().year(year).month(0);
        this.isFilled = false;
        this.fill(date);
        this.doNotListenScrolling = false;
        //this.scrollToMonth(this.renderedRange.start);
    }

    updateDropdownValue(date) {
        if (this.dropDownCurrentValue) {
            var year = date.year();
            var dropDownListItem;
            for (var i = 0; i < this.dropDownList.childNodes.length; i++) {
                $(this.dropDownList.childNodes[i]).removeClass('current');
                if (parseInt(this.dropDownList.childNodes[i].innerHTML, 10) === year) {
                    dropDownListItem = this.dropDownList.childNodes[i];
                }
            }
            if (dropDownListItem) {
                $(dropDownListItem).addClass('current');
            }
            this.dropDownCurrentValue.innerHTML = year;
        }
    }

    renderHeader() {
        var container = document.createElement('div');
        container.className = this.classes.header;
        var head = document.createElement('div');
        head.className = 'thead';
        container.appendChild(head);
        container.setAttribute('aria-hidden', 'true');

        var row = document.createElement('div');

        var daysInWeek = 7;
        for (var i = daysInWeek - 1; i >= 0; i--) {
            var cell = document.createElement('div');
            cell.innerHTML = this.shortWeekDayNames[i];
            cell.className = 'calendar-week-day';
            row.appendChild(cell);
        }
        head.appendChild(row);

        this.weekDaysRow = row;

    //         var nextMonthButton = document.createElement('button');
    //         nextMonthButton.textContent = '>';
    //         nextMonthButton.className = 'calendar-next-month-button';
    //         var prevMonthButton = document.createElement('button');
    //         prevMonthButton.textContent = '<';
    //         prevMonthButton.className = 'calendar-prev-month-button';
    //         var self = this;
    //         nextMonthButton.addEventListener('click', function(){
    //             self.renderNext();
    //         }, false);
    //         prevMonthButton.addEventListener('click', function(){
    //             self.renderPrev();
    //         }, false);
    //         head.appendChild(prevMonthButton);
    //         head.appendChild(nextMonthButton);

        return container;
    }


    renderInput() {
        if (this.inputRender) {
            return;
        }
        var self = this;

        var inputContainer = document.createElement('div');
        inputContainer.className = this.classes.input;

        var accessibleInput = document.createElement('input');
        accessibleInput.setAttribute('aria-describedby', 'calendar-help');
        accessibleInput.className = "special-hidden";
        inputContainer.appendChild(accessibleInput);

        var dateInput = document.createElement('input');
        dateInput.setAttribute('aria-describedby', 'calendar-help');
        dateInput.setAttribute('aria-hidden', 'true');
        inputContainer.appendChild(dateInput);

        var inputHelp = document.createElement('div');
        var inputHelpDescription = document.createElement('div');
        inputHelpDescription.className = 'calendar-help-description';
        inputHelp.className = 'calendar-help';
        inputHelp.id = 'calendar-help'; // XXX may be not unique

        var inputList = document.createElement('ul');
        inputList.setAttribute('tabindex', 0);
        var helpItems = locales[this.locale].help;
        if (this.options && this.options.isRange) {
            helpItems = locales[this.locale].rangeHelp;
        }
        for (var i = 1; i < helpItems.length; i++) {
            var inputListItem = document.createElement('li');
            var html = helpItems[i];
            if (i === 1) {
                inputListItem.className = 'calendar-help-caption';
            } else {
                $(inputListItem).on('click', function() {
                    var txt = $(this).text().replace(/,$/, '');
                    $(dateInput).val(txt).trigger('keyup', {submit: true});
                });
                html += '<span class="special-hidden">,</span>';
            }

            inputListItem.innerHTML = html;
            inputList.appendChild(inputListItem);
        }
        inputHelpDescription.innerHTML = helpItems[0];
        inputHelp.appendChild(inputHelpDescription);
        inputHelp.appendChild(inputList);
        this.container.appendChild(inputHelp);
        dateInput.placeholder = locales[this.locale].placeholder;
        dateInput.setAttribute('aria-describedby', 'calendar-help');



        function showInput() {
            $(inputHelp).fadeIn(300);
        }

        $(dateInput)
            .on('mouseenter', function() {
                $(inputContainer).closest('.calendar-wrapper-date').addClass('is-hover-input');
                if ('requestAnimationFrame' in window) {
                    $(dateInput).one('transitionend webkitTransitionEnd otransitionend MSTransitionEnd', showInput);
                } else {
                    showInput();
                }
                self.hideYearDropdownList();
            })
            .on('mouseleave', function() {
                if (!$(dateInput).data('hasFocus')) {
                    $(inputHelp).fadeOut(200);
                    $(inputContainer).closest('.calendar-wrapper-date').removeClass('is-hover-input');
                    $(dateInput).off('webkitTransitionEnd transitionend otransitionend MSTransitionEnd');
                }
            })
            .on('focus', function(e) {
                $(inputContainer).closest('.calendar-wrapper-date').addClass('is-active-input');
                $(inputHelp).show();
                $(dateInput).data('hasFocus', true);
            }).on('blur', function(e) {
                $(inputContainer).closest('.calendar-wrapper-date').removeClass('is-active-input is-hover-input');
                $(dateInput).off('webkitTransitionEnd transitionend otransitionend MSTransitionEnd');
                $(inputHelp).fadeOut(200);
                $(dateInput).data('hasFocus', false);
            });

        this.lastInputValue = null;
        this.lastParsedRange = null;
        this.lastParsedDate = null;


        $(dateInput).on('keyup', this.onInput.bind(this));
        $(accessibleInput).on('keyup', this.onAccessibleInput.bind(this));

        $(this.wrapperDate).prepend(inputContainer);

        this.dateInput = dateInput;
        this.inputRender = true;
        this.inputHelp = inputHelp;
        this.inputContainer = inputContainer;
        this.accessibleInput = accessibleInput;
    }

    onAccessibleInput(e, data) {
        this.dateInput.value = this.accessibleInput.value;
        this.onInput(e, data);
    }

    onInput(e, data) {
        var dateInput = this.dateInput;
        var loc = locales[this.locale];

        function showValidity(isValid, error) {
            // Date in future or before 1900
            if (isValid) {
                $(dateInput).removeClass('error');
                $(dateInput).removeAttr('title');
            } else {
                $(dateInput).addClass('error');
                $(dateInput).attr('title', error || loc.errors.dateInFuture);
            }
        }

        var value = $(this.dateInput).val();

        if (!value) {
            return;
        }

        if (this.lastInputValue !== value) {
            this.lastInputValue = value;

            var parsedRange = this.dateRangeParser.parse(value, {min: this.min, max: this.max});

            if (parsedRange && parsedRange.start) {
                this.lastParsedRange = parsedRange;

                var startDate = moment.utc(parsedRange.start);
                var endDate = moment.utc(parsedRange.end);

                this.lastParsedRange = {start: +startDate, end: +endDate};
                if (this.lastParsedDate !== startDate){// && moment.utc(startDate).isValid()) {
                    this.isFilled = false;
                    this.fill(startDate);
                    this.setSelection(startDate);
                    this.lastParsedDate = startDate;
                }
                showValidity(true);
            } else {
                showValidity(false, loc.errors.dateNotParsed);
                this.lastParsedRange = null;
            }
        }
        if (this.lastParsedRange && (e.keyCode === 13 || (data && data.submit))) {
            $(this.inputHelp).hide();
            $(this.inputContainer).removeClass('is-active');
            $(this.inputContainer).next('.calendar-year-dropdown').show();

            if (this.options && !this.options.isRange) {
                var dt = this.options.reversed? this.lastParsedRange.end: this.lastParsedRange.start;
                this.lastParsedRange = {start: +dt, end: +dt};
            }
            var range = new DateRange(unifiedDate(this.lastParsedRange.start),
                                      unifiedDate(this.lastParsedRange.end));
            $(this.container).trigger('select.range', [range]);
            this.lastParsedRange = null;

            this.isFilled = false;
            this.fill(range.start);

            //console.log('    AFTER YEAR CHANGE', this.range.start.toDate() + '',
            //                                     this.range.end.toDate() + '')
        }
    }

    renderDay(date) {
        var dayContainer = document.createElement('div');
        dayContainer.className = this.classes.day;
        dayContainer.innerHTML = date.date();

        $(dayContainer).data('datetime', date.toISOString());

        if (this.isToday(date)) {
            $(dayContainer).addClass(this.classes.today);
        }

        if (! this.lastRange.start.isSame(date, 'month') ||
               date.isAfter(this.max) || date.isBefore(this.min)) {
            $(dayContainer).addClass('calendar-not-this-month');
            $(dayContainer).html('&#8226;');
        } else {
            $(dayContainer).attr('title', date.format('D MMMM YYYY, dddd'));
        }

        if (this.selection && +date == +this.selection && !$(dayContainer).hasClass('calendar-not-this-month')) {
            this.selectedDayContainer = dayContainer;
            $(dayContainer).addClass('active');
        }
        return dayContainer;
    }

    renderWeek(date, targetDate) {
        var daysInWeek = 7;
        var newDate;
        var startDate = moment.utc(date).startOf('week');
        var endDate = startDate.clone().add(1, 'week');

        if (this.min && endDate.isBefore(this.min)) {
            return;
        }

        if (this.max && moment.utc(startDate).isAfter(this.max)) {
            return;
        }

        var row = document.createElement('div');
        row.className = this.classes.row;
        for (var i = daysInWeek - 1; i >= 0; i--) {
            newDate = startDate.clone().add(i, 'days');
            row.appendChild(this.renderDay(newDate));
        }

        var dateString = targetDate.year() + '' + targetDate.month();

        if (this.rowsMap[dateString]) {
            this.rowsMap[dateString].push(row);
        } else {
            this.rowsMap[dateString] = [row];
        }

        $(row).data('month', targetDate.month());
        $(row).data('year', targetDate.year());
        return row;
    }

    empty() {
        for (var i in this.rowsMap) {
            if (this.rowsMap.hasOwnProperty(i)) {
                var elements = this.rowsMap[i];
                for (var j = 0; j < elements.length; j++) {
                    elements[j].parentNode.removeChild(elements[j]);
                }
                delete this.rowsMap[i];
            }
        }
        for (i in this.monthHeaderMap) {
            if (this.monthHeaderMap.hasOwnProperty(i)) {
                var header = this.monthHeaderMap[i];
                header.parentNode.removeChild(header);
                delete this.monthHeaderMap[i];
            }
        }
        this.monthsRendered = 0;
    }

    removeMonth() {
        var edge;
        if (this.direction === 'up') {
            edge = this.renderedRange.start;
        } else {
            edge = this.renderedRange.end;
        }
        var dateString = edge.year() + '' + edge.month();
        var elements = this.rowsMap[dateString];
        if (elements) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].parentNode.removeChild(elements[i]);
            }
            delete this.rowsMap[dateString];
        }

        var header = this.monthHeaderMap[dateString];
        if (header) {
            header.parentNode.removeChild(header);
        }
        delete this.monthHeaderMap[dateString];

        if (this.direction === 'up') {
            this.renderedRange.start = edge.clone().add(1, 'month').startOf('month');
        } else {
            this.renderedRange.end = edge.clone().add(-1, 'month').endOf('month').startOf('day');
        }
        //console.log('    AFTER REMOVE MONTH', this.renderedRange.start.toDate() + '',
        //                                      this.renderedRange.end.toDate() + '')

        this.monthsRendered--;
        var e = $.Event('delete', {detail: edge});
        $(this.container).trigger(e);
    }

    renderMonth(date) {
        //console.log('    RENDER MONTH', date.toDate()+'');
        this.doNotListenScrolling = true;
        if (this.monthsRendered > this.monthSpan) {
            this.removeMonth();
        }

        var start = moment.utc(date).startOf('month');
        var end = start.clone().endOf('month').startOf('day');
        //console.log('    start/end', start.toDate()+'', end.toDate()+'');
        var range = new DateRange(start, end);

        if (this.max && moment.utc(start).isAfter(this.max)) {
            return;
        }

        if (this.min && moment.utc(end).isBefore(this.min)) {
            return;
        }

        var prevHeight = this.scrollContainer.scrollHeight;

        if (this.direction === 'up') {
            this.renderWeeks(range);
            this.renderMonthHeader(date);
        } else {
            this.renderMonthHeader(date);
            this.renderWeeks(range);
        }

        if (this.direction === 'up') {
            this.scrollContainer.scrollTop += this.scrollContainer.scrollHeight - prevHeight;
        }

        var e = $.Event('render', {detail: date});
        $(this.container).trigger(e);
        this.monthsRendered++;
        this.doNotListenScrolling = false;
    }

    renderMonthHeader(date) {
        var row = document.createElement('div');
        row.className = 'calendar-month-header';
        var headerCell = document.createElement('div');
        headerCell.innerHTML = this.format(date, 'mmmm, yyyy');
        row.appendChild(headerCell);
        if (this.direction === 'up') {
            $(this.table).prepend(row);
        } else {
            this.table.appendChild(row);
        }
        $(row).data('month', date.month());
        $(row).data('year', date.year());
        this.monthHeaderMap[date.year() + '' + date.month()] = row;
    }

    renderWeeks(range) {
        this.lastRange = range;
        var firstWeekDay = range.start.clone().startOf('week');
        var elements = [];
        var i = 0;

        while (+firstWeekDay <= +range.end) {
            var week = this.renderWeek(firstWeekDay, range.start);
            if (week) {
                elements.push(week);
            }
            firstWeekDay = firstWeekDay.clone().add(1, 'week');
        }

        if (this.direction === 'up') {
            for (i; i < elements.length; i++) {
                $(this.table).prepend(elements[i]);
            }
        } else {
            elements = elements.reverse();
            for (i = 0; i < elements.length; i++) {
                this.table.appendChild(elements[i]);
            }
        }

        if (!this.renderedRange.start || this.renderedRange.start.isAfter(range.start)) {
            this.renderedRange.start = range.start;
        }
        if (!this.renderedRange.end || this.renderedRange.end.isBefore(range.end)) {
            this.renderedRange.end = range.end;
        }
    }

    renderNext() {
        if (!this.renderedRange.start) {
            return;
        }
        //console.log('RENDER next');
        var date = this.renderedRange.start.clone().subtract(1, 'day').startOf('month');
        var dateEnd = date.clone().endOf('month').startOf('day');
        if (this.min && +this.min <= +dateEnd && !this.renderedRange.isInside(date)) {
            this.direction = 'down';
            this.renderMonth(date);
            return true;
        } else {
            return false;
        }
    }

    renderPrev() {
        if (!this.renderedRange.end) {
            return;
        }
        //console.log('RENDER prev');
        var date = this.renderedRange.end.clone().add(1, 'day');
        if (this.max && +this.max >= +date && !this.renderedRange.isInside(date)) {
            this.direction = 'up';
            this.renderMonth(date);
            return true;
        } else {
            return false;
        }
    }

    fill(date) {
        if (this.isFilled) {
            return;
        }

        this.empty();

        date = unifiedDate(date);
        this.renderedRange.start = date.clone().startOf('month');
        this.renderedRange.end = date.clone().endOf('month').startOf('day');

        if (date.clone().subtract(2, 'month').isBefore(this.min)) {
            date = this.min.clone();
            this.renderMonth(date);
            this.renderPrev();
            this.renderPrev();
            return;
        }
        if (date.isAfter(this.max)) {
            return;
        }
        this.renderMonth(date);
        //console.log(this.renderedRange);
        this.renderNext();
        this.renderNext();

        this.isFilled = true;
    }

    getDate() {
        return this.date;
    }

    setDate(date) {
        this.date = moment.utc(date).startOf('day');
    }

    setSelection(date) {
        date = unifiedDate(date);
        if (this.selection && +date == +this.selection) {
            return;
        }
        this.selection = date;
        if (this.selectedDayContainer) {
            $(this.selectedDayContainer).removeClass('active');
        }
        var cell = this.getDateCell(date);
        var animated = false;
        if (cell) {
            this.selectedDayContainer = cell;
            $(cell).addClass('active');
            animated = true;
        } else {
            this.isFilled = false;
            this.fill(date);
        }
        this.scrollToMonth(date, animated);
    }

    getDateCell(date) {
        if (!date) {
            return;
        }
        date = unifiedDate(date);
        var dateString = date.year() + '' + date.month();

        if (this.rowsMap[dateString]) {
            var rows = this.rowsMap[dateString];
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var $filteredItems = $(row).find('.calendar-day').filter(function(_, item) {
                    var itemDate = moment.utc($(item).data('datetime'));
                    return itemDate.month() === date.month() && itemDate.date() === date.date();
                });
                if ($filteredItems.length === 1) {
                    return $filteredItems.get(0);
                }
            }
        }
    }

    scrollToMonth(date) {
        date = unifiedDate(date);
        var dateString = date.year() + '' + date.month();
        var monthHeaderElement = this.monthHeaderMap[dateString];
        if (!monthHeaderElement) {
            return;
        }

        // this.scrollContainer.scrollTop += $(monthHeaderElement).position().top - 15;
    }

    highLightWeekDay(dayIndex) {
        this.unhighLightWeekDays();
        if (dayIndex === 0) { dayIndex = 7; } // Sunday
        $(this.weekDaysRow.childNodes[7 - dayIndex]).addClass('hover');
    }

    unhighLightWeekDays() {
        for (var i = 0; i < this.weekDaysRow.childNodes.length; i++) {
            $(this.weekDaysRow.childNodes[i]).removeClass('hover');
        }
    }

    format(date, text) {
        date = unifiedDate(date);
        var d = date.date(),
            D = date.day(),
            m = date.month() + 1,
            y = date.year();

        var tmpTag = $('<a/>');

        function zeropad(val, len) {
            val = '' + val;
            len = len || 2;
            while (val.length < len) {
                val = '0' + val;
            }
            return val;
        }

        function _f(text, flags) {
            return text.replace(/d{1,4}|m{1,4}|yy(?:yy)?|"[^"]*"|'[^']*'/g, function($0) {
                return $0 in flags ? flags[$0] : $0;
            });
        }

        var flags = {
            d: d,
            dd: zeropad(d),
            ddd: locales[this.locale].shortWeekDayNames[D],
            dddd: locales[this.locale].dayNames[D],
            m: m,
            mm: zeropad(m),
            //    mmm: locales[this.locale].shortMonths[m-1],
            mmmm: locales[this.locale].monthNames[m - 1],
            yy: String(y).slice(2),
            yyyy: y
        };

        var ret = _f(text, flags);

        return tmpTag.html(ret).html();
    }
}
