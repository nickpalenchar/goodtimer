/** @fileOverview a time class **/
import {addPadding} from "./timeutil";

const NEGATIVE_SUPPORT = false; // A later version will suport negatives

interface timeObject {
    milliseconds?: number
    seconds?: number
    minutes?: number
    hours?: number
    days?: number
    years?: number
}

type TimeExpression =
    | number
    | string
    | timeObject
    | Time;

class Time {
    private __sign: -1 | 1 = 1;
    protected _time: Array<Array<number>> = [];

    /**
     * @ignore
     */
    get _sign() {
        return this.__sign
    }
    set _sign(val) {
        // TODO: Currently, negatives are not supported. Negatives use a _sign parameter set to -1
        // For now, this setter is used to detect a negative, and throws accordingly. When negatives
        // are supported, this setter can be removed
        if (val === -1) {
            throw new RangeError('negatives are not supported');
        }
        this.__sign = val;
    }

    constructor(timeExpression: TimeExpression = "0") {
        this.set(timeExpression);
    }

    public set(timeExpression: TimeExpression) {
        /**
         * Immediately changes the instances time to the given argument.
         */
        if (typeof timeExpression === 'number') {
            if (timeExpression < 0) {
                this._sign = -1;
                timeExpression = Math.abs(timeExpression);
            }
            // @ts-ignore
            timeExpression = timeExpression.toString() + 'ms';
        }
        if (typeof timeExpression === 'string') {
            if (/^[^\d\w]*-/.test(timeExpression)) {
                this._sign = -1;
                timeExpression = timeExpression.replace(/^([^\d\w]*)(-)(.*)$/, '$1$3');
            }
            // match regex ending with dot
            const matchArray = timeExpression.match(/\.(.*)$/);
            if (matchArray) {
                const mills = matchArray[1];
                if (mills.length === 2) {
                    timeExpression += '0';
                }
                if (mills.length === 1) {
                    timeExpression += '00';
                }
            }
            this._time = this._parse(timeExpression).map(val => val === null ? [0] : [val]);
        }
        else if (typeof timeExpression === 'number') {

        }
        else if (timeExpression instanceof Time) {
            this._sign = timeExpression._sign;
            this._time = timeExpression._time.map(val => [val[0]]);
        }
        else if (typeof timeExpression === 'object') {
            this._time = [
                [(timeExpression?.years || 0)],
                [(timeExpression?.days || 0)],
                [(timeExpression?.hours || 0)],
                [(timeExpression?.minutes || 0)],
                [(timeExpression?.seconds || 0)],
                [(timeExpression?.milliseconds || 0)],
            ]
        }

        else {
            throw new TypeError("Can't parse given timeExpression.");
        }
        this._adjustTime(0)
    }

    public add(time: TimeExpression, _ignoreSigns: boolean=false): void {

        const toAdd = time instanceof Time ? time : new Time(time);

        if (!_ignoreSigns) {
            if (this._sign === -1 && toAdd._sign === 1) {
                const signTemp = this._sign;
                this.abs(true).subtract(toAdd);
                this._sign *= signTemp;
                return;
            }
            if (this._sign === 1 && toAdd._sign === -1) {
                const signTemp = this._sign;
                this.subtract(toAdd.abs());
                this._sign *= signTemp;
            }
        }

        const signTemp = this._sign;

        this.abs(true)._adjustTime(toAdd.abs().inMilliseconds());

        this._sign = signTemp;
        return


        this.milliseconds = this.milliseconds - toAdd.milliseconds;
        this.seconds = this.seconds - toAdd.seconds;
        this.minutes = this.minutes - toAdd.minutes;
        this.hours = this.hours - toAdd.hours;
        this.days = this.days - toAdd.days;
        this.years = this.years - toAdd.years;
    }

    public abs(set: boolean=false): Time {
        /** Returns a new Time instance that is the absolute value.
         *  If 'set' is true, mokes this instance absolute value and
         *  returns that instead.
         *  @ignore - not needed until negatives are supported
         */
        if (set) {
            this._sign = 1;
            return this;
        }
        const absTime = new Time(this);
        absTime._sign = 1;
        return absTime;
    }

    setSign(sign): Time {
        /**
         * Reserved for future features with negatives
         * @ignore
         */
        // @ts-ignore
        this._sign = Math.sign(sign) || 1;
        return this;
    }

    equals(time: timeObject) {
        const compare: Time = time instanceof Time ? time : new Time(time);
        return this.years === compare.years
            && this.days === compare.days
            && this.hours === compare.hours
            && this.minutes === compare.minutes
            && this.seconds === compare.seconds
            && this.milliseconds === compare.milliseconds;
    }

    gt(time: number | string | Time): boolean {
        const compare = time instanceof Time ? time : new Time(time);

        if (this.years === compare.years) {
            if (this.days === compare.days) {
                if (this.hours === compare.hours) {
                    if (this.minutes === compare.minutes) {
                        if (this.seconds === compare.seconds) {
                            if (this.milliseconds === compare.milliseconds) {
                                return false;
                            }
                            return this.milliseconds > compare.milliseconds;
                        }
                        return this.seconds > compare.seconds;
                    }
                    return this.minutes > compare.minutes;
                }
                return this.hours > compare.hours;
            }
            return this.days > compare.days;
        }
        return this.years > compare.years;
    }

    gte(time: number | string | Time): boolean {
        const compare = time instanceof Time ? time : new Time(time);

        if (this.years === compare.years) {
            if (this.days === compare.days) {
                if (this.hours === compare.hours) {
                    if (this.minutes === compare.minutes) {
                        if (this.seconds === compare.seconds) {
                            if (this.milliseconds === compare.milliseconds) {
                                return true;
                            }
                            return this.milliseconds > compare.milliseconds;
                        }
                        return this.seconds > compare.seconds;
                    }
                    return this.minutes > compare.minutes;
                }
                return this.hours > compare.hours;
            }
            return this.days > compare.days;
        }
        return this.years > compare.years;
    }


    lt(time: number | string | Time): boolean {
        const compare = time instanceof Time ? time : new Time(time);

        if (this.years === compare.years) {
            if (this.days === compare.days) {
                if (this.hours === compare.hours) {
                    if (this.minutes === compare.minutes) {
                        if (this.seconds === compare.seconds) {
                            if (this.milliseconds === compare.milliseconds) {
                                return false;
                            }
                            return this.milliseconds < compare.milliseconds;
                        }
                        return this.seconds < compare.seconds;
                    }
                    return this.minutes < compare.minutes;
                }
                return this.hours < compare.hours;
            }
            return this.days < compare.days;
        }
        return this.years < compare.years;
    }

    lte(time: timeObject): boolean {
        const compare = time instanceof Time ? time : new Time(time);

        if (this.years === compare.years) {
            if (this.days === compare.days) {
                if (this.hours === compare.hours) {
                    if (this.minutes === compare.minutes) {
                        if (this.seconds === compare.seconds) {
                            if (this.milliseconds === compare.milliseconds) {
                                return true;
                            }
                            return this.milliseconds < compare.milliseconds;
                        }
                        return this.seconds < compare.seconds;
                    }
                    return this.minutes < compare.minutes;
                }
                return this.hours < compare.hours;
            }
            return this.days < compare.days;
        }
        return this.years < compare.years;
    }


    subtract(time: number | string | Time, _ignoreSigns: boolean=false): void {

        const toSubtract = time instanceof Time ? time : new Time(time);

        if (!_ignoreSigns) {
            if(this._sign === 1 && toSubtract._sign === -1) {
                this.add(toSubtract.abs());
                return;
            }
            if(this._sign === -1 && toSubtract._sign === 1) {
                const signTemp = this._sign;
                this.abs(true).add(toSubtract);
                this._sign *= signTemp;
                return;
            }
            if (this._sign + toSubtract._sign === -2) {
                const signTemp = this._sign;
                this.abs(true).subtract(toSubtract, true);
                this._sign *= signTemp;
                return;
            }
        }

        this._adjustTime(-toSubtract.inMilliseconds())
        return;

        this.milliseconds = this.milliseconds - toSubtract.milliseconds;
        this.seconds = this.seconds - toSubtract.seconds;
        this.minutes = this.minutes - toSubtract.minutes;
        this.hours = this.hours - toSubtract.hours;
        this.days = this.days - toSubtract.days;
        this.years = this.years - toSubtract.years;
        return;

        if (toSubtract.abs().gt(this.abs())) {
            // TODO: replace with setTime
            const newSubtract = new Time(this);

            this.years = toSubtract.years;
            this.hours = toSubtract.hours;
            this.days = toSubtract.days;
            this.minutes = toSubtract.minutes;
            this.seconds = toSubtract.seconds;
            this.milliseconds = toSubtract.milliseconds;
            this._sign *= -1;
            return this.subtract(newSubtract);
        }
        this.years = Math.abs(this.years) - Math.abs(toSubtract.years);
        this.days = Math.abs(this.days) - Math.abs(toSubtract.days);
        this.hours = Math.abs(this.hours) -Math.abs(toSubtract.hours);
        this.minutes = Math.abs(this.minutes) - Math.abs(toSubtract.minutes);
        this.seconds = Math.abs(this.seconds) - Math.abs(toSubtract.seconds);
        this.milliseconds = Math.abs(this.milliseconds) - Math.abs(toSubtract.milliseconds);
    }

    inMilliseconds() {
        return this.years * 365 * 24 * 60 * 60 * 1000 +
            this.days * 24 * 60 * 60 * 1000 +
            this.hours * 60 * 60 * 1000 +
            this.minutes * 60 * 1000 +
            this.seconds * 1000 +
            this.milliseconds;
    }

    protected _adjustTime(milliseconds: number) {
        /** Adjusts time by a number of milliseconds. Pass negative number to decrement.
         */
        const {_adjustAndCarry: aac} = this;

        aac(this._time[0], Infinity,
            aac(this._time[1], 364,
                aac(this._time[2], 23,
                    aac(this._time[3], 59,
                        aac(this._time[4], 59,
                            aac(this._time[5], 999, milliseconds))))));
    }

    protected _adjustAndCarry(num: number[], resetValue: number, interval: number): number {

        let val: number = num[0] + interval;
        let carry: number = 0;

        while (val < 0) {
            val += (resetValue + 1);
            carry -= 1;
        }
        while (val > resetValue) {
            val -= (resetValue + 1);
            carry += 1;
        }
        num[0] = val;
        return carry;
    }

    protected _getCarryover(num, threshold): [number, number] {
        /** Calculates the "carry-over", that is, how many whole units can be divided from a
         * threshold. This is used to calculate when, say, the seconds unit has more than allowed (60).
         * In that case, a number of "minutes" should be extracted from it (over the "threshold" of 60).
         */
        const carryover = (num - (num % threshold)) / threshold;
        const remaining = num % threshold;
        return [carryover, remaining];
    }

     protected _fromMilliseconds(num: number) {
        let result = [0, 0, 0, 0, 0, num];

        if (result[5] < 1000) {
            return result;
        }
        [result[4], result[5]] = this._getCarryover(result[5], 1000);


        if(result[4] < 60) {
            return result;
        }
        [result[3], result[4]] = this._getCarryover(result[4], 60);
        const minutes = result[3];

        if(result[3] < 60) {
            return result
        }
        [result[2], result[3]] = this._getCarryover(result[3], 60);
        const hours = result[2];

        if(hours < 24) {
            return result;
        }
        [result[1], result[2]] = this._getCarryover(result[2], 24);
        const days = result[1];

        if(result[1] < 365) {
            return result;
        }
        [result[0], result[1]] = this._getCarryover(result[1], 365);
        return result
    }
    protected _adjustOverflow(place: number, threshold: number): number {
        /**
         * Sets the value at placemarker (value) to a positive number within its
         * threshold, adding to larger places if needed.
         *
         * If the value is within the threshold, nothing happens.
         */
        if (place === 0) {
            // the largest placement has no limit
            return 0;
        }
        if (this._time[place][0] >= threshold) {
            const [carryOver, remaining] = this._getCarryover(this._time[place][0], threshold);
            this._time[place][0] = remaining;
            return carryOver;
        }
        return 0;
    }

    protected _adjustUnderflow(place: number, threshold) {
        if (this._time[place][0] < 0) {
            if (this._time.slice(0, place).some(el => el[0])) {
                const [carryOver, remainingInverse] = this._getCarryover(Math.abs(this._time[place][0]), threshold);
                this._time[place][0] = (threshold - remainingInverse) % threshold;
                return  -(carryOver);
            }
            // Arriving here, there are no further places to borrow from, and sign must flip
            if (NEGATIVE_SUPPORT) {
                this._sign *= -1;
                this._time[place][0] = Math.abs(this._time[place][0]);
            }
            else {
                this._time[place][0] = 0;
            }
        }
        return 0;
    }

    protected _largestIndex(): number {
        /**
         * Returns the index (from this._time) which is the largest unit of
         * time that is non-zero.
         *
         * It is important to know the largest unit, because if it is subtracted
         * by a value greater, the sign needs to be flipped.
         */
        for (let i = 0; i < this._time.length; i++) {
            if (this._time[i][0]) {
                return i;
            }
        }
        return this._time.length - 1;
    }

    // [_years, _days, _hours, minutes, seconds, milliseconds]
    //  0      1     2      3        4        5
    public get milliseconds() {
        return this._time[5][0] * this._sign;
    }
    public set milliseconds(n) {
        this._time[5][0] = n;
        const over = this._adjustOverflow(5, 1000);
        const under = this._adjustUnderflow(5, 1000);
        this.seconds = this._time[4][0] + over + under;
    }

    /**
     * @deprecated use [[Time.milliseconds]] instead
     */
    public get ms() {
        /** Alias of .milliseconds. **/
        return this.milliseconds;
    }
    public set ms(n) {
        this.milliseconds = n;
    }

    public get seconds() {
        return this._time[4][0] * this._sign;
    }
    public set seconds(n) {
        this._time[4][0] = n;
        const over = this._adjustOverflow(4, 60);
        const under = this._adjustUnderflow(4, 60);
        this.minutes = this._time[3][0] + over + under;
    }
    get secs() {
        /** Alias of this#seconds **/
        return this.seconds;
    }
    set secs(n) {
        /**
         * @alias seconds
         */
        this.seconds = n
    }
    get minutes() {
        return this._time[3][0] * this._sign;
    }
    set minutes(n) {
        this._time[3][0] = n
        const over = this._adjustOverflow(3, 60);
        const under = this._adjustUnderflow(3, 60);
        this.hours = this._time[2][0] + over + under;
    }
    /**
     * @deprecated use [[Time.minutes]] instead
     **/
    get mins() {
        return this.minutes;
    }
    set mins(n) {
        this.minutes = n;
    }
    public get hours() {
        return this._time[2][0] * this._sign;
    }
    public set hours(n) {
        this._time[2][0] = n;
        const over = this._adjustOverflow(2, 24);
        const under = this._adjustUnderflow(2, 24);
        this.days = this._time[1][0] + over + under;
    }
    public get days() {
        return this._time[1][0] * this._sign;
    }
    public set days(n) {
        this._time[1][0] = n;
        const over = this._adjustOverflow(1, 365);
        const under = this._adjustUnderflow(1, 365);
        this.years = this._time[0][0] + over + under;
    }
    public get years() {
        return this._time[0][0] * this._sign;
    }
    public set years(n) {
        if (n < 0) {
            this._sign *= -1;
            n = Math.abs(n)
        }
        this._time[0][0] = n;
    }

    protected _parse(time: string): number[] {
        // TODO: this does NOT parse negative values. That is expected to be handled
        // by the instances _sign prop. A seperate parseTime for the client should
        // be created, which applies the _sign as appropriate after the initial parsing.
        if (/[dshmy]+/.test(time)) {

            const valuesAtIndex = ['y', 'd', 'h', 'm', 's', 'ms'];
            let parsedTime = [null, null, null, null, null, null];
            let workingInt: string = ''

            for (let i = 0; i < time.length; i++) {
                if (/\d/.test(time[i])) {
                    workingInt += time[i];
                } else if (time[i] + time[i + 1] === 'ms') {
                    if (parsedTime[5] !== null) {
                        throw new SyntaxError("Duplicate token 'ms'");
                    }
                    parsedTime[5] = workingInt;
                    workingInt = '';
                    i++;
                }
                else if (/[dshmy]/.test(time[i])) {
                    if (parsedTime[valuesAtIndex.indexOf(time[i])] !== null) {
                        throw new SyntaxError("Duplicate token " + time[i]);
                    }
                    parsedTime[valuesAtIndex.indexOf(time[i])] = workingInt;
                    workingInt = '';
                }
                else {
                    throw new SyntaxError("Unexpected token " + time[i]);
                }
            }
            return parsedTime.map(i => isNaN(parseInt(i)) ? 0 : parseInt(i))
        }
        if (/(?:\d+:){0,4}\d+/.test(time)) {
            // colon separated syntax
            let [others, mils] = time.split('.')
            let parsed: any[] = others.split(/[^\d.]/).concat(mils);

            parsed = parsed.map(i => isNaN(parseInt(i)) ? 0 : parseInt(i));

            while (parsed.length < 6) {
                parsed = [0].concat(parsed);
            }
            // TODO milliseconds
            return parsed;

        } else {
            throw TypeError("Cannot _parse string as time.")
        }
    }

    /** Returns time in "YY:DD:hh:ss:mm.mills" format, optionally truncating some units.
     *
     *  @param minUnit - Lowest unit of time to show. Units lower than `minUnit` will not be shown. 'ms' or '' means
     *  include every unit.
     *  @param maxUnit Largest unit of time to show. All units of time larger than this are *added* to the maxUnit.
     *  E.g. '01:01:01.000'.toString('', 'm') returns '61:01.000'
     *
     *  @returns Formatted string representing the time. If maxUnit is greater than minUnit, returns ''
     */
    toString(minUnit?: string|void, maxUnit: string='y'): string {
        minUnit = minUnit || 'ms';
        let result: string[] = [];
        const timeUnitIndex: string[] = ['y', 'd', 'h', 'm', 's', 'ms'];

        if (timeUnitIndex.indexOf(minUnit) < timeUnitIndex.indexOf(maxUnit)) {
            return '';
        }

        //HACK: If maxUnit is ms, just return from .inMilliseconds()
        if (maxUnit === 'ms') {
            return this.inMilliseconds().toString();
        }

        const unitDownMultiplier: number[] = [365, 24, 60, 60, 1000, 1];
        let nonZeroSeen: boolean = false;

        const firstUnit: number = timeUnitIndex.indexOf(maxUnit);
        let carryOver: number = 0;
        for (let i = 0; i < this._time.length - 1; i++) {
            let val = this._time[i][0] + carryOver;
            carryOver = 0;
            // seconds (i=4) should always be added
            if (val || nonZeroSeen || i === 4) {
                nonZeroSeen = true;
                if (i < firstUnit) {
                    carryOver += val * unitDownMultiplier[i];
                }
                else {
                    result.push(addPadding(val, 2));
                }
            }
        }

        const lastUnit: number = timeUnitIndex.indexOf(minUnit) - firstUnit;
        let resultStr: string = result.slice(0, lastUnit+1).join(':');
        if (!minUnit || minUnit === 'ms') {
            resultStr += `.${addPadding(this.milliseconds, 3)}`;
        }
        return resultStr;
    }

}

export { Time };
