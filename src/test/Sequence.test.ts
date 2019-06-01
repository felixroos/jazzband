import { Sequence } from '../sheet/Sequence';

test('Sequence.getSequence', () => {

});

test('Sequence.simplePath', () => {
    expect(Sequence.simplePath([1, 0])).toEqual('1');
    expect(Sequence.simplePath([1, 0, 1])).toEqual('1.0.1');
    expect(Sequence.simplePath([1, 0, 0, 1])).toEqual('1.0.0.1');
    expect(Sequence.simplePath([0, 0, 0, 1])).toEqual('0.0.0.1');
    expect(Sequence.simplePath([0, 0, 1])).toEqual('0.0.1');
    expect(Sequence.simplePath([0])).toEqual('0');
    expect(Sequence.simplePath([20])).toEqual('20');
    expect(Sequence.simplePath([20, 0])).toEqual('20');
})

test('Sequence.getSequenceSignType', () => {
    expect(Sequence.getSignType('/')).toBe('prolong');
    expect(Sequence.getSignType('e5')).toBe(undefined);
})