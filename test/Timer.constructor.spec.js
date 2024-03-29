let {Timer} = require('../build/node');

describe('creating a Timer instance (constructor fn)', () => {
    it('works as (time:string)', () => {
        const t = new Timer('4:30', {startPaused: true});
        expect(t.seconds).toBe(30);
        expect(t.minutes).toBe(4);

        const t2 = new Timer('1:30:23:59:60.300', {startPaused: true});
        expect([t2.years, t2.days, t2.hours, t2.minutes, t2.seconds, t2.milliseconds])
            .toStrictEqual([1, 31, 0, 0, 0, 300]);
    });

    it('works as (time: string, timeUpFn: Function', () => {
        const t = new Timer('04', function () {
        });
        expect([t.days, t.hours, t.minutes, t.seconds, t.milliseconds])
            .toStrictEqual([0, 0, 0, 4, 0]);
        expect(t.years).toBe(0);
        expect(typeof t.options.onTimeout).toEqual('function');
    });

    it('works as (time: string, timeUpFn: Function, intervalFn: Function', () => {
        const t = new Timer('4h33s10ms', function () {
        }, function () {
        }, {startPaused: true});
        expect([t.years, t.days, t.hours, t.minutes, t.seconds, t.milliseconds])
            .toStrictEqual([0, 0, 4, 0, 33, 10]);
        expect(typeof t.options.onInterval).toEqual('function');
    });
    it('works as (time: string, options: object)', () => {
        const t = new Timer('1y', {
            onTimeout: function onTimeout() {
            },
            onInterval: function onInterval() {
            }
        });

        expect(t.years).toBe(1);
        expect(t.options.onTimeout.name).toEqual('onTimeout');
        expect(t.options.onInterval.name).toEqual('onInterval');
    });


});

describe('Timer options', () => {

    it('delays tick if immediateInterval is false', () => {
        const timerDelay = new Timer('10', {immediateInterval: false});
        const timerStandard = new Timer('10');
        const spyDelay = jest.spyOn(timerDelay, 'tick');
        const spyStandard = jest.spyOn(timerStandard, 'tick')
        timerDelay.pause();

        expect(spyDelay).not.toHaveBeenCalled();
        // expect(spyStandard).toHaveBeenCalled(); TODO: this is failing when it should be passing
    });

    it('Repeats with repeat option', () => {
        let callTimes = 0;
        const timesUp = () => callTimes++;
        const timer = new Timer('3', {onTimeout: timesUp, repeat: true});
        timer.pause();
        timer.tick(true);
        timer.tick(true);
        timer.tick(true)
        expect(callTimes).toEqual(1);
        expect(timer.seconds).toEqual(3);
    });

    describe('object notaition', () => {
        it('works with multiple properties', () => {
            const t = new Timer({minutes: 1, seconds: 20});
            expect(t.minutes).toBe(1);
            expect(t.seconds).toBe(20);
        });

        it('works with all properties in any order', () => {
            const t = new Timer({
                minutes: 3,
                milliseconds: 444,
                years: 2,
                hours: 11,
                days: 8,
                seconds: 59
            }, {startPaused: true});
            expect(t.years).toBe(2);
            expect(t.minutes).toBe(3);
            expect(t.seconds).toBe(59);
            expect(t.milliseconds).toBe(444);
            expect(t.hours).toBe(11);
            expect(t.days).toBe(8);
        });
    });
});
