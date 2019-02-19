import { Distance } from 'tonal';
import { Interval } from 'tonal';

test('Tonal.Interval', () => {
    expect(Distance.interval('D', 'C')).toBe('7m');
    expect(Distance.interval('C', 'D')).toBe('2M');
    expect(Distance.interval('D', 'Db')).toBe('8d');
    expect(Distance.interval('D#', 'D')).toBe('8d');
    expect(Distance.interval('Db', 'D')).toBe('1A');
    expect(Distance.interval('D', 'D#')).toBe('1A');
    expect(Distance.interval('D2', 'Db2')).toBe('-1A');
    expect(Distance.interval('D2', 'D#2')).toBe('1A');
    expect(Distance.interval('D2', 'Db3')).toBe('8d');
    expect(Distance.interval('D2', 'D#3')).toBe('8A');
    expect(Distance.interval('D2', 'D#1')).toBe('-8d');
    expect(Distance.interval('D2', 'Db1')).toBe('-8A');
    /* expect(Interval.invert('1A')).toBe('8d');
    expect(Interval.invert('1d')).toBe('8A');
    expect(Interval.invert('1P')).toBe('8P');
    expect(Interval.invert('8P')).toBe('1P');
    expect(Interval.invert('8d')).toBe('1A'); */
});