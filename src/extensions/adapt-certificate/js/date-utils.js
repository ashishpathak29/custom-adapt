//var d = new Date(); 
//d_string = d.format("m/d/Y h:i:s");

/**************************************
 * Date class extension
 * 
 *
// Provide month names
Date.prototype.getMonthName = function () {
    var month_names = [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December'
                        ];

    return month_names[this.getMonth()];
}

// Provide month abbreviation
Date.prototype.getMonthAbbr = function () {
    var month_abbrs = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec'
                        ];

    return month_abbrs[this.getMonth()];
}

// Provide full day of week name
Date.prototype.getDayFull = function () {
    var days_full = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ];
    return days_full[this.getDay()];
};

// Provide full day of week name
Date.prototype.getDayAbbr = function () {
    var days_abbr = [
                            'Sun',
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thur',
                            'Fri',
                            'Sat'
                        ];
    return days_abbr[this.getDay()];
};

// Provide the day of year 1-365
Date.prototype.getDayOfYear = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((this - onejan) / 86400000);
};

// Provide the day suffix (st,nd,rd,th)
Date.prototype.getDaySuffix = function () {
    var d = this.getDate();
    var sfx = ["th", "st", "nd", "rd"];
    var val = d % 100;

    return (sfx[(val - 20) % 10] || sfx[val] || sfx[0]);
};

// Provide Week of Year
Date.prototype.getWeekOfYear = function () {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

// Provide if it is a leap year or not
Date.prototype.isLeapYear = function () {
    var yr = this.getFullYear();

    if ((parseInt(yr) % 4) == 0) {
        if (parseInt(yr) % 100 == 0) {
            if (parseInt(yr) % 400 != 0) {
                return false;
            }
            if (parseInt(yr) % 400 == 0) {
                return true;
            }
        }
        if (parseInt(yr) % 100 != 0) {
            return true;
        }
    }
    if ((parseInt(yr) % 4) != 0) {
        return false;
    }
};

// Provide Number of Days in a given month
Date.prototype.getMonthDayCount = function () {
    var month_day_counts = [
                                    31,
                                    this.isLeapYear() ? 29 : 28,
                                    31,
                                    30,
                                    31,
                                    30,
                                    31,
                                    31,
                                    30,
                                    31,
                                    30,
                                    31
                                ];

    return month_day_counts[this.getMonth()];
}

// format provided date into this.format format
Date.prototype.format = function (dateFormat) {
    // break apart format string into array of characters
    dateFormat = dateFormat.split("");

    var date = this.getDate(),
        month = this.getMonth(),
        hours = this.getHours(),
        minutes = this.getMinutes(),
        seconds = this.getSeconds();
    // get all date properties ( based on PHP date object functionality )
    var date_props = {
        d: date < 10 ? '0' + date : date,
        D: this.getDayAbbr(),
        j: this.getDate(),
        l: this.getDayFull(),
        S: this.getDaySuffix(),
        w: this.getDay(),
        z: this.getDayOfYear(),
        W: this.getWeekOfYear(),
        F: this.getMonthName(),
        m: month < 10 ? '0' + (month + 1) : month + 1,
        M: this.getMonthAbbr(),
        n: month + 1,
        t: this.getMonthDayCount(),
        L: this.isLeapYear() ? '1' : '0',
        Y: this.getFullYear(),
        y: this.getFullYear() + ''.substring(2, 4),
        a: hours > 12 ? 'pm' : 'am',
        A: hours > 12 ? 'PM' : 'AM',
        g: hours % 12 > 0 ? hours % 12 : 12,
        G: hours > 0 ? hours : "12",
        h: hours % 12 > 0 ? hours % 12 : 12,
        H: hours,
        i: minutes < 10 ? '0' + minutes : minutes,
        s: seconds < 10 ? '0' + seconds : seconds
    };

    // loop through format array of characters and add matching data else add the format character (:,/, etc.)
    var date_string = "";
    for (var i = 0; i < dateFormat.length; i++) {
        var f = dateFormat[i];
        if (f.match(/[a-zA-Z]/g)) {
            date_string += date_props[f] ? date_props[f] : '';
        } else {
            date_string += f;
        }
    }

    return date_string;
};
/*
 *
 * END - Date class extension
 * 
 ************************************/
define(function (require) {
     var DateUtils = function () {};

    /**
     * Finds the english ordinal suffix for the number given.
     *    
     * @param value: Number to find the ordinal suffix of.
     * @return Returns the suffix for the number, 2 characters.
     * @example
     *      <code>
     *            trace(32 + MathUtils.getOrdinalSuffix(32)); // Traces 32nd
     *        </code>
     * @author http://as3.casalib.org/docs/org_casalib_util_NumberUtil.html#getOrdinalSuffix
     */
    var getOrdinalSuffix = function (value) {
            if (value >= 10 && value <= 20)
                return 'th';

            if (value == 0)
                return '';

            switch (value % 10) {
                case 3:
                    return 'rd';
                case 2:
                    return 'nd';
                case 1:
                    return 'st';
                default:
                    return 'th';
            }
        }
        /**
         * <p>Utility to add zeros in a back of a given string or a number.</p>
         * <p><b>author:</b> Lukasz 'Severiaan' Grela</p>
         * @author Lukasz 'Severiaan' Grela
         * @version 1.1.2
         */
    var appendZeros = function (p_oValue, p_nPlaces) {
            var _sOtuput = p_oValue + "";
            if(typeof p_nPlaces === 'undefined' || p_nPlaces < 0) p_nPlaces = 2;
            while (_sOtuput.length < p_nPlaces) {
                _sOtuput = _sOtuput + "0";
            }
            return _sOtuput;
        }
        /**
         * <p>Utility to add zeros in a front of a given string or a number.</p>
         * <listing>
         * var _oToday:Date = new Date();
         * var _sDate:String = prependZeros(_oToday.date, 2);
         * var _sMonth:String = prependZeros(_oToday.month+1, 2);
         * var _sYear:String = _oToday.getFullYear();
         *
         * trace(_sDate + "/" + _sMonth + "/" + _sYear);
         *
         * </listing>
         * <p><b>author:</b> Lukasz 'Severiaan' Grela</p>
         * @version 1.1.2
         * @author Lukasz 'Severiaan' Grela
         */
    var prependZeros = function (p_oValue, p_nPlaces) {
        var _sOtuput = p_oValue.toString();
        if(typeof p_nPlaces === 'undefined' || p_nPlaces < 0) p_nPlaces = 2;
        
        while (_sOtuput.length < p_nPlaces) {
            _sOtuput = "0" + _sOtuput;
        }
        return _sOtuput;
    }




    //static
    //---------------------------------------
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>ATOM date format (example: 2005-08-15T15:52:01+00:00)</p>
     */
    DateUtils.FORMAT_ATOM = "Y-m-d^TH:i:sP";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>HTTP Cookie date format (example: Monday, 15-Aug-05 15:52:01 UTC)</p>
     */
    DateUtils.FORMAT_COOKIE = "l, d-M-y H:i:s T";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>ATOM date format (example: 2005-08-15T15:52:01+0000)</p>
     */
    DateUtils.FORMAT_ISO8601 = "Y-m-d^TH:i:sO";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 822 date format (example: Mon, 15 Aug 05 15:52:01 +0000)</p>
     */
    DateUtils.FORMAT_RFC822 = "D, d M y H:i:s O";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 850 date format (example: Monday, 15-Aug-05 15:52:01 UTC) </p>
     */
    DateUtils.FORMAT_RFC850 = "l, d-M-y H:i:s T";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 1036 date format (example: Mon, 15 Aug 05 15:52:01 +0000)</p>
     */
    DateUtils.FORMAT_RFC1036 = "D, d M y H:i:s O";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 1123 date format (example: Mon, 15 Aug 2005 15:52:01 +0000)</p>
     */
    DateUtils.FORMAT_RFC1123 = "D, d M Y H:i:s O";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 2822 date format (example:  Mon, 15 Aug 2005 15:52:01 +0000)</p>
     */
    DateUtils.FORMAT_RFC2822 = "D, d M Y H:i:s O";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RFC 3339 date format, same as DateUtils.FORMAT_ATOM</p>
     */
    DateUtils.FORMAT_RFC3339 = "Y-m-d^TH:i:sP";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>RSS date format (example: Mon, 15 Aug 2005 15:52:01 +0000)</p>
     */
    DateUtils.FORMAT_RSS = "D, d M Y H:i:s O";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>World Wide Web Consortium date format (example: 2005-08-15T15:52:01+00:00)</p>
     */
    DateUtils.FORMAT_W3C = "Y-m-d^TH:i:sP";
    /**
     * <p>Format pattern string used in DateUtils.format method.</p>
     * <p>Date format as returned by toString method of Date object (example: Fri Oct 28 08:00:00 GMT+0100 2011)</p>
     */
    DateUtils.FORMAT_FLASH = "D M d H:i:s ^G^M^TO Y";

    /**
     * <p>Character used to escape format characters recognised in format function.</p>
     */
    DateUtils.FORMAT_ESCAPE_CHARACTER = "^";

    /**
     * <p>English names of the week days.</p>
     */
    DateUtils.WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    /**
     * <p>English names of the months</p>
     */
    DateUtils.MONTHS_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    /**
     * <p>Timezone abbreviations</p>
     */
    DateUtils.TIMEZONES = ['IDLW', 'NT', 'HST', 'AKST', 'PST', 'MST', 'CST', 'EST', 'AST', 'ADT', 'AT', 'WAT', 'GMT', 'CET', 'EET', 'MSK', 'ZP4', 'ZP5', 'ZP6', 'WAST', 'WST', 'JST', 'AEST', 'AEDT', 'NZST'];

    //---------------------------------------
    /**
     * <p>Adds equivalent in weeks of milliseconds to the given time.</p>
     * @param	date
     * @param	weeks
     * @return
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/Date.html#getTime%28%29
     */
    DateUtils.addWeeks = function (date, weeks) {
        return DateUtils.addDays(date, weeks * 7);
    };
    /**
     * <p>Adds equivalent in days of milliseconds to the given time.</p>
     * @param	date
     * @param	days
     * @return
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/Date.html#getTime%28%29
     */
    DateUtils.addDays = function (date, days) {
        return DateUtils.addHours(date, days * 24);
    };
    /**
     * <p>Adds equivalent in hours of milliseconds to the given time.</p>
     * @param	date
     * @param	hrs
     * @return
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/Date.html#getTime%28%29
     */
    DateUtils.addHours = function (date, hrs) {
        return DateUtils.addMinutes(date, hrs * 60);
    };
    /**
     * <p>Adds equivalent in minutes of milliseconds to the given time.</p>
     * @param	date
     * @param	mins
     * @return
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/Date.html#getTime%28%29
     */
    DateUtils.addMinutes = function (date, mins) {
        return DateUtils.addSeconds(date, mins * 60);
    };
    /**
     * <p>Adds equivalent in seconds of milliseconds to the given time.</p>
     * @param	date
     * @param	secs
     * @return
     * @see http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/Date.html#getTime%28%29
     */
    DateUtils.addSeconds = function (date, secs) {
        var mSecs = secs * 1000;
        var sum = mSecs + date.getTime();
        return new Date(sum);
    };

    DateUtils.getMonthLength = function (month, year) {
        var _oDate = new Date();
        if (!isNaN(year)) _oDate.setFullYear(year);
        _oDate.setDate(1);
        _oDate.setHours(0);
        _oDate.setMinutes(0);
        _oDate.setSeconds(0);
        _oDate.setMilliseconds(0);

        _oDate.setMonth(month + 1);

        return DateUtils.addDays(_oDate, -1).getDate();
    };
    /**
     * <p>Similar to the PHP date(format, timestamp) function, converts Date object into formatted string using pattern.</p>
     * @param	pattern if null or empty then <code>DateUtils.FORMAT_FLASH</code> is used. Unrecognized characters in the format string will be printed as-is.
     * @param	date if null then current local time is used <code>DateUtils.now</code> method
     * @return
     * @see http://php.net/manual/en/function.date.php
     */
    DateUtils.format = function (pattern, date) {
        //Fri Oct 28 08 GMT+0100 2011
        var pat =  typeof pattern !== 'undefined' && pattern != null && pattern != "" ? pattern:DateUtils.FORMAT_FLASH;
        var dat = date && typeof date !== 'undefined' ? date:DateUtils.now();

        var output = "";
        var char;
        for (var i = 0; i < pat.length; i++) {
            char = pat.charAt(i);

            if (char == DateUtils.FORMAT_ESCAPE_CHARACTER) {
                if (i + 1 < pat.length)
                    char = pat.charAt(i + 1);
                //take as is
                output += char;
                i++;
            } else {
                //match mattern
                output += DateUtils.getFormatString(char, dat);
            }

        }

        return output;
    };
    /**
     * <p>Helper method that will escape those characters that are recognised by format function.</p>
     * @param	p_sInput
     * @return
     */
    DateUtils.escapeStringForFormat = function (p_sInput) {
        if (typeof p_sInput === 'undefined' || p_sInput == null || p_sInput == "")
            return p_sInput;

        var _sOutput = "";
        var _nLength = p_sInput.length
        for (var i = 0; i < _nLength; i++) {
            var formatChar = p_sInput.charAt(i);
            //recognise
            switch (formatChar) {
                //Day
                case "d":
                case "D":
                case "j":
                case "l":
                case "N":
                case "S":
                case "w":
                case "z":
                    //Week
                case "W":
                    //Month
                case "F":
                case "m":
                case "M":
                case "n":
                case "t":
                    //Year
                case "L":
                case "o":
                case "Y":
                case "y":
                    //Time
                case "a":
                case "A":
                case "B":
                case "g":
                case "G":
                case "h":
                case "H":
                case "i":
                case "s":
                case "u":
                    //Timezone
                case "e":
                case "T":
                case "I":
                case "O":
                case "P":
                case "Z":
                    //Full Date/Time
                case "c":
                case "r":
                case "U":
                    _sOutput += DateUtils.FORMAT_ESCAPE_CHARACTER + formatChar;
                    break;

                default: //as is
                    _sOutput += formatChar;
            } //switch

        } //for
        return _sOutput;
    };

    /**
     * <p>Returns timezone abbreviation.</p>
     * @param	d
     * @return
     * @author http://as3.casalib.org/docs/org_casalib_util_DateUtil.html#getTimezone
     */
    DateUtils.getTimezone = function (d) {
        var hour = Math.round(12 + -(d.getTimezoneOffset() / 60));

        if (DateUtils.isDST(d))
            hour--;

        return DateUtils.TIMEZONES[hour];
    };
    /**
     * <p>Determines if given date is within the Daylight Saving Time</p>
     * @param	d
     * @return
     */
    DateUtils.isDST = function (d) {
        if (!d || typeof d === 'undefined') return false;

        var winter = new Date(d.getFullYear(), 0, 1); //January
        var summer = new Date(d.getFullYear(), 6, 1); //July

        var offset = Math.max(winter.getTimezoneOffset(), summer.getTimezoneOffset());

        //trace("offset=" + offset);
        //trace("d.getTimezoneOffset()=" + d.getTimezoneOffset());

        return d.getTimezoneOffset() < offset;
    };
    /**
     * <p>Returns the day of the year for the given date.</p>
     * @param	date
     * @return
     */
    DateUtils.getDayOfTheYear = function (date) {
        if (!date || typeof date === 'undefined') return 0;

        var jan1st = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);

        var diff = date.getTime() - jan1st.getTime();

        return Math.floor(diff / 86400000);
    };
    /**
     * <p>Determines the week number of year, weeks start on Mondays.</p>
     * 
     * @param d: Date object to find the current week number of.
     * @return Returns the the week of the year the date falls in.
     * @author http://as3.casalib.org/docs/org_casalib_util_DateUtil.html#getWeekOfTheYear
     */
    DateUtils.getWeekOfTheYear2 = function (d) {
        var firstDay = new Date(d.getFullYear(), 0, 1);
        var dayOffset = 9 - firstDay.getDay();
        var firstMonday = new Date(d.getFullYear(), 0, (dayOffset > 7) ? dayOffset - 7 : dayOffset);
        var currentDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        var weekNumber = (((currentDay.getTime() - firstMonday.getTime()) / 7) / 86400000) + 1;

        return (weekNumber == 0) ? DateUtils.getWeekOfTheYear(new Date(d.getFullYear() - 1, 11, 31)) : weekNumber;
    };
    /**
     * <p>Get the ISO week date week number</p>
     * @param	date
     * @return
     * @author http://techblog.procurios.nl/k/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     */
    DateUtils.getWeekOfTheYear = function (date) {
        // Create a copy of this date object
        var target = new Date(date.getTime());

        // ISO week date weeks start on monday
        // so correct the day number
        var dayNr = (date.getDay() + 6) % 7;

        // ISO 8601 states that week 1 is the week
        // with the first thursday of that year.
        // Set the target date to the thursday in the target week
        target.setDate(target.getDate() - dayNr + 3);

        // Store the millisecond value of the target date
        var firstThursday = target.getTime();

        // Set the target to the first thursday of the year
        // First set the target to january first
        target.setMonth(0, 1);
        // Not a thursday? Correct the date to the next thursday
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }

        // The weeknumber is the number of weeks between the 
        // first thursday of the year and the thursday in the target week
        return 1 + Math.ceil((firstThursday - target.getTime()) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000			
    };
    /** 
     * <p>Get the ISO week date year number </p>
     * @author http://techblog.procurios.nl/k/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     */
    DateUtils.getWeekYear = function (date) {
        if (!date || typeof date === 'undefined') return NaN;
        // Create a new date object for the thursday of this week  
        var target = new Date(date.getTime());
        target.setDate(target.getDate() - ((date.getDay() + 6) % 7) + 3);

        return target.getFullYear();
    };
    /**
     * <p>Checks if the given date (year) is leap (year contains additional day - 29th Feb).</p>
     * @param	date
     * @return
     */
    DateUtils.isLeapYear = function (date) {
        if (!date || typeof date === 'undefined') return false;

        var febLength =  DateUtils.getMonthLength(1, date.getFullYear());

        return febLength == 29;
    };
    DateUtils.isLeapYear2 = function (yr) {
        if ((parseInt(yr) % 4) == 0) {
            if (parseInt(yr) % 100 == 0) {
                if (parseInt(yr) % 400 != 0) {
                    return false;
                }
                if (parseInt(yr) % 400 == 0) {
                    return true;
                }
            }
            if (parseInt(yr) % 100 != 0) {
                return true;
            }
        }
        if ((parseInt(yr) % 4) != 0) {
            return false;
        }
    };
    /**
     * <p>Returns the weekday of the requested date</p>
     * @param	day
     * @param	month
     * @param	fullYear
     * @return
     */
    DateUtils.getWeekDayForDate = function (day, month, fullYear) {
        var _oDate = reset(new Date());
        _oDate.setFullYear(fullYear);
        _oDate.setMonth(month);
        _oDate.setDate(day);
        
        return _oDate.getDay();
    };

    /**
     * <p>Returns the today date (local time) with time reset to 00.000</p>
     */
    DateUtils.today = function () {
        var _oToday = now;

        _oToday.setMilliseconds(0);
        _oToday.setSeconds(0);
        _oToday.setMinutes(0);
        _oToday.setHours(0);

        return _oToday;
    };
    /**
     * <p>Returns the date object set to the time at the call.</p>
     */
    DateUtils.now = function () {
        var _oNow = new Date();
        return _oNow;
    };
    //            

    //private static
    DateUtils.getFormatString = function (formatChar, date) {
        var hrs;
        var tzohrs;
        var i;
        if (!formatChar || typeof formatChar === 'undefined' || formatChar.length != 1 || !date || typeof date === 'undefined') {
            return formatChar;
        }

        //recognise
        switch (formatChar) {
            //Day
            case "d": //Day of the month, 2 digits with leading zeros
                return prependZeros(date.getDate());
            case "D": //A textual representation of a day, three letters
                return DateUtils.WEEKDAYS[date.getDay()].substring(0, 3);
            case "j": //	Day of the month without leading zeros
                return date.getDate().toString();

            case "l": //A full textual representation of the day of the week
                return DateUtils.WEEKDAYS[date.getDay()];

            case "N": //ISO-8601 numeric representation of the day of the week
                i = date.getDay();
                if (i == 0) {
                    return "7";
                };
                return i.toString();

            case "S": //English ordinal suffix for the day of the month, 2 characters
                return getOrdinalSuffix(date.getDate());

            case "w": //Numeric representation of the day of the week
                return date.getDay().toString();

            case "z": //The day of the year (starting from 0)
                return DateUtils.getDayOfTheYear(date).toString();

                //Week
            case "W": //ISO-8601 week number of year, weeks starting on Monday
                return DateUtils.getWeekOfTheYear(date).toString();

                //Month
            case "F": //A full textual representation of a month, such as January or March
                return DateUtils.MONTHS_NAMES[date.getMonth()];

            case "m": //Numeric representation of a month, with leading zeros
                return prependZeros(date.getMonth() + 1);

            case "M": //A short textual representation of a month, three letters
                return DateUtils.MONTHS_NAMES[date.getMonth()].substring(0, 3);

            case "n": //Numeric representation of a month, without leading zeros
                return date.getMonth() + 1 + "";

            case "t": //Number of days in the given month
                i = DateUtils.getMonthLength(date.getMonth(), date.getFullYear()); //month, year
                return i.toString();

                //Year
            case "L": //Whether it's a leap year, 1 if it is a leap year, 0 otherwise.
                return DateUtils.isLeapYear(date) ? "1" : "0";

            case "o": //ISO-8601 year number. This has the same value as Y, except that if the ISO week number (W) belongs to the previous or next year, that year is used instead.
                return DateUtils.getWeekYear(date).toString();

            case "Y": //A full numeric representation of a year, 4 digits
                return prependZeros(date.getFullYear(), 4);

            case "y": //A two digit representation of a year
                return prependZeros(date.getFullYear().toString().substr(-2));

                //Time
            case "a": //Lowercase Ante meridiem and Post meridiem, 	am or pm
                return DateUtils.format("A", date).toLowerCase();

            case "A": //Uppercase Ante meridiem and Post meridiem, 	AM or PM
                hrs = date.getHours();
                if (hrs > 12) {
                    return "PM";
                }
                return "AM";

            case "B": //Swatch Internet time, 	000 through 999
                return DateUtils.getSwatchTime(date).toString();

            case "g": //12-hour format of an hour without leading zeros, 	1 through 12
                hrs = date.getHours();
                if (hrs > 12) {
                    hrs -= 12;
                }
                if (hrs == 0)
                    hrs = 12;
                return hrs.toString();

            case "G": //24-hour format of an hour without leading zeros, 	0 through 23
                return date.getHours().toString();

            case "h": //	12-hour format of an hour with leading zeros, 	01 through 12
                return prependZeros(DateUtils.format("g", date));

            case "H": //24-hour format of an hour with leading zeros, 	00 through 23
                return prependZeros(date.getHours());

            case "i": //Minutes with leading zeros, 	00 to 59
                return prependZeros(date.getMinutes());

            case "s": //Seconds, with leading zeros, 	00 through 59
                return prependZeros(date.getSeconds());

            case "u": //Microseconds (added in PHP 5.2.2), 	Example: 719000 (always 3 zeros at the end as in Flash we have only milliseconds 1/1000 of the second and microsecond is 1/1000000 of the second)
                return "" + (date.getMilliseconds() * 1000);

                //Timezone
            case "e": //Timezone identifier, 	Examples: UTC, GMT, Atlantic/Azores
            case "T": //Timezone abbreviation, 	Examples: EST, MDT
                return DateUtils.getTimezone(date);

            case "I": //Whether or not the date is in daylight saving time, 	1 if Daylight Saving Time, 0 otherwise.
                return DateUtils.isDST(date) ? "1" : "0";

            case "O": //Difference to Greenwich time (GMT) in hours, 	Example: +0200

                tzohrs = Math.floor(-date.getTimezoneOffset() / 60);
                return (tzohrs >= 0 ? "+" : "-") + prependZeros(Math.abs(tzohrs)) + "00"; //TODO: check if the GMT will return minutes

            case "P": //Difference to Greenwich time (GMT) with colon between hours and minutes, 	Example: +02
                tzohrs = Math.floor(-date.getTimezoneOffset() / 60);
                return (tzohrs >= 0 ? "+" : "-") + prependZeros(Math.abs(tzohrs)) + ""; //TODO: check if the GMT will return minutes

            case "Z": //Timezone offset in seconds. The offset for timezones west of UTC is always negative, and for those east of UTC is always positive, 	-43200 through 50400
                return Math.round(-date.getTimezoneOffset() * 60).toString();

                //Full Date/Time
            case "c": //ISO 8601 date (added in PHP 5) 	2004-02-12T15+00
                return DateUtils.format(DateUtils.FORMAT_ISO8601, date); //TODO: this can be done quicker instead of not duplicating functionality

            case "r": //	Â» RFC 2822 formatted date 	Example: Thu, 21 Dec 2000 16 +0200
                return DateUtils.format(DateUtils.FORMAT_RFC2822, date); //TODO: this can be done quicker instead of not duplicating functionality

            case "U": //Seconds since the Unix Epoch (January 1 1970 00 GMT)
                return Math.round(date.getTime() / 1000).toString();
            default: //as is
                return formatChar;
        }

    };
    /**
     * 
     * @param	date
     * @return
     * @author http://javascript.about.com/library/blswatch.htm
     */
    DateUtils.getSwatchTime = function (date) {
        if (!date || typeof date === 'undefined') return NaN;

        var swatch = ((date.getUTCHours() + 1) % 24) + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

        return Math.floor(swatch * 1000 / 24);
    };

/*
var now = DateUtils.now();
var formatted = DateUtils.format(DateUtils.FORMAT_ATOM, now);
var formatted2 = DateUtils.format(DateUtils.FORMAT_COOKIE, now);
var formatted3 = DateUtils.format(DateUtils.FORMAT_ISO8601, now);
var formatted4 = DateUtils.format(DateUtils.FORMAT_RFC822, now);
var formatted5 = DateUtils.format(DateUtils.FORMAT_RFC850, now);
var formatted6 = DateUtils.format(DateUtils.FORMAT_RFC1036, now);
var formatted7 = DateUtils.format(DateUtils.FORMAT_RFC1123, now);
var formatted8 = DateUtils.format(DateUtils.FORMAT_RFC2822, now);
var formatted9 = DateUtils.format(DateUtils.FORMAT_RFC3339, now);
var formatted10 = DateUtils.format(DateUtils.FORMAT_RSS, now);
var formatted11 = DateUtils.format(DateUtils.FORMAT_W3C, now);
var formatted12 = DateUtils.format(DateUtils.FORMAT_FLASH, now);
alert(formatted+"\n"+formatted2+"\n"+formatted3+"\n"+formatted4+"\n"+formatted5+"\n"+formatted6+"\n"+formatted7+"\n"+formatted8+"\n"+formatted9+"\n"+formatted10+"\n"+formatted11+"\n"+formatted12);
*/
    return DateUtils;
})
