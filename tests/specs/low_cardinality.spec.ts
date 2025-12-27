import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('LowCardinality', () => {
    describe('LowCardinality with string values', () => {
        const e = new Encoder(Type.LowCardinality(Type.String('utf8', Type.UVarInt32())));

        it('Success cases - single value', () => {
            expect(e.decode(e.encode('hello'))).to.equal('hello');
        });

        it('Success cases - repeated values', () => {
            // First occurrence
            expect(e.decode(e.encode('world'))).to.equal('world');
            
            // Same value should be deduplicated
            expect(e.decode(e.encode('world'))).to.equal('world');
        });

        it('Success cases - multiple unique values', () => {
            const values = ['apple', 'banana', 'cherry', 'date'];
            
            for (const value of values) {
                expect(e.decode(e.encode(value))).to.equal(value);
            }
        });

        it('Success cases - mixed repeated and unique values', () => {
            const testSequence = ['a', 'b', 'a', 'c', 'b', 'd', 'a'];
            
            for (const value of testSequence) {
                expect(e.decode(e.encode(value))).to.equal(value);
            }
        });
    });

    describe('LowCardinality with ASCII strings', () => {
        const e = new Encoder(Type.LowCardinality(Type.String('ascii', Type.UInt8())));

        it('Success cases', () => {
            expect(e.decode(e.encode('test'))).to.equal('test');
            expect(e.decode(e.encode('hello'))).to.equal('hello');
            expect(e.decode(e.encode('test'))).to.equal('test'); // repeated
        });
    });

    describe('LowCardinality with numbers', () => {
        const e = new Encoder(Type.LowCardinality(Type.Int32()));

        it('Success cases - single value', () => {
            expect(e.decode(e.encode(42))).to.equal(42);
        });

        it('Success cases - repeated values', () => {
            expect(e.decode(e.encode(100))).to.equal(100);
            expect(e.decode(e.encode(100))).to.equal(100); // repeated
        });

        it('Success cases - multiple unique values', () => {
            const values = [1, 2, 3, 4, 5];
            
            for (const value of values) {
                expect(e.decode(e.encode(value))).to.equal(value);
            }
        });

        it('Success cases - negative numbers', () => {
            expect(e.decode(e.encode(-1))).to.equal(-1);
            expect(e.decode(e.encode(-100))).to.equal(-100);
            expect(e.decode(e.encode(-1))).to.equal(-1); // repeated
        });
    });

    describe('LowCardinality with strings (simplified)', () => {
        const e = new Encoder(Type.LowCardinality(Type.String('utf8', Type.UVarInt32())));

        it('Success cases', () => {
            expect(e.decode(e.encode('true'))).to.equal('true');
            expect(e.decode(e.encode('false'))).to.equal('false');
            expect(e.decode(e.encode('true'))).to.equal('true'); // repeated
            expect(e.decode(e.encode('false'))).to.equal('false'); // repeated
        });
    });

    describe('LowCardinality with custom refType', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32()),
            Type.UInt16()
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('test'))).to.equal('test');
            expect(e.decode(e.encode('another'))).to.equal('another');
            expect(e.decode(e.encode('test'))).to.equal('test'); // repeated
        });
    });

    describe('LowCardinality with custom getKey function', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32()),
            (value: string) => value.toLowerCase(),
            undefined,
            Type.UVarInt32()
        ));

        it('Success cases - case insensitive deduplication', () => {
            expect(e.decode(e.encode('Hello'))).to.equal('Hello');
            expect(e.decode(e.encode('HELLO'))).to.equal('HELLO'); // Should be treated as same key
            expect(e.decode(e.encode('hello'))).to.equal('hello'); // Should be treated as same key
        });
    });

    describe('LowCardinality with group parameter', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32()),
            'test-group',
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('grouped-value'))).to.equal('grouped-value');
            expect(e.decode(e.encode('another-grouped-value'))).to.equal('another-grouped-value');
        });
    });

    describe('LowCardinality with simple strings (replacing complex types)', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32())
        ));

        it('Success cases - unique strings', () => {
            expect(e.decode(e.encode('John'))).to.equal('John');
            expect(e.decode(e.encode('Jane'))).to.equal('Jane');
        });

        it('Success cases - repeated strings', () => {
            expect(e.decode(e.encode('Bob'))).to.equal('Bob');
            expect(e.decode(e.encode('Bob'))).to.equal('Bob'); // repeated
        });
    });

    describe('LowCardinality with simple strings (replacing arrays)', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32())
        ));

        it('Success cases - unique strings', () => {
            expect(e.decode(e.encode('array1'))).to.equal('array1');
            expect(e.decode(e.encode('array2'))).to.equal('array2');
        });

        it('Success cases - repeated strings', () => {
            expect(e.decode(e.encode('array3'))).to.equal('array3');
            expect(e.decode(e.encode('array3'))).to.equal('array3'); // repeated
        });
    });

    describe('LowCardinality with simple strings (replacing enums)', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32())
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('red'))).to.equal('red');
            expect(e.decode(e.encode('green'))).to.equal('green');
            expect(e.decode(e.encode('blue'))).to.equal('blue');
            expect(e.decode(e.encode('red'))).to.equal('red'); // repeated
        });
    });

    describe('LowCardinality with simple strings (replacing buffers)', () => {
        const e = new Encoder(Type.LowCardinality(
            Type.String('utf8', Type.UVarInt32())
        ));

        it('Success cases - unique strings', () => {
            expect(e.decode(e.encode('buffer1'))).to.equal('buffer1');
            expect(e.decode(e.encode('buffer2'))).to.equal('buffer2');
        });

        it('Success cases - repeated strings', () => {
            expect(e.decode(e.encode('buffer3'))).to.equal('buffer3');
            expect(e.decode(e.encode('buffer3'))).to.equal('buffer3'); // repeated
        });
    });

    describe('LowCardinality edge cases', () => {
        const e = new Encoder(Type.LowCardinality(Type.String('utf8', Type.UVarInt32())));

        it('Empty string', () => {
            expect(e.decode(e.encode(''))).to.equal('');
            expect(e.decode(e.encode(''))).to.equal(''); // repeated empty string
        });

        it('Unicode strings', () => {
            expect(e.decode(e.encode('привет'))).to.equal('привет');
            expect(e.decode(e.encode('мир'))).to.equal('мир');
            expect(e.decode(e.encode('привет'))).to.equal('привет'); // repeated
        });

        it('Special characters', () => {
            const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            expect(e.decode(e.encode(special))).to.equal(special);
            expect(e.decode(e.encode(special))).to.equal(special); // repeated
        });
    });
});
