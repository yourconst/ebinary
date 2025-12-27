import { Encoder, Type } from '../../../src';
import { expect } from 'chai';

function generateVarIntTestValues() {
    return [
        0,
        1,
        -1,
        127,
        -127,
        128,
        -128,
        255,
        -255,
        256,
        -256,
        16383,
        -16383,
        16384,
        -16384,
        2097151,
        -2097151,
        2097152,
        -2097152,
        268435455,
        -268435455,
        268435456,
        -268435456,
        2147483647,
        -2147483647,
        -2147483648,
    ];
}

function generateUVarIntTestValues() {
    return [
        0,
        1,
        127,
        128,
        255,
        256,
        16383,
        16384,
        2097151,
        2097152,
        268435455,
        268435456,
        4294967295,
    ];
}

describe('VarInt32', () => {
    const e = new Encoder(Type.VarInt32());

    it('Success cases', () => {
        const testValues = generateVarIntTestValues();
        
        for (const v of testValues) {
            expect(e.decode(e.validateEncode(v))).to.equal(v);
            expect(e.decode(e.encode(v))).to.equal(v);
        }
    });

    it('Edge cases', () => {
        // Test boundary values
        expect(e.decode(e.encode(0))).to.equal(0);
        expect(e.decode(e.encode(1))).to.equal(1);
        expect(e.decode(e.encode(-1))).to.equal(-1);
        expect(e.decode(e.encode(2147483647))).to.equal(2147483647);
        expect(e.decode(e.encode(-2147483648))).to.equal(-2147483648);
    });

    it('Encoded size matches expected varint32 byte lengths', () => {
        // +1 for LC header byte
        const cases: Array<[number, number]> = [
            // zero and small positive/negative
            [0, 1], [1, 1], [-1, 1],
            // 1-byte limits
            [63, 1], [-64, 1],
            // 2-byte starts
            [64, 2], [-65, 2],
            [8191, 2], [-8192, 2],
            // 3-byte starts
            [8192, 3], [-8193, 3],
            [1048575, 3], [-1048576, 3],
            // 4-byte starts
            [1048576, 4], [-1048577, 4],
            [134217727, 4], [-134217728, 4],
            // 5-byte starts (extremes)
            [134217728, 5], [-134217729, 5],
            [2147483647, 5], [-2147483648, 5],
        ];

        for (const [value, size] of cases) {
            const encoded1 = e.validateEncode(value);
            const encoded2 = e.encode(value);
            expect({
                value,
                encoded1Size: encoded1.length,
                encoded2Size: encoded2.length,
            }).to.deep.equal({
                value,
                encoded1Size: size,
                encoded2Size: size,
            });
        }
    });

    it('Fail cases', () => {
        // Test values outside the valid range
        expect(() => e.validateEncode(2147483648)).to.throw();
        expect(() => e.validateEncode(-2147483649)).to.throw();
        expect(() => e.validateEncode(Number.MAX_SAFE_INTEGER)).to.throw();
        expect(() => e.validateEncode(Number.MIN_SAFE_INTEGER)).to.throw();
    });
});

describe('UVarInt32', () => {
    const e = new Encoder(Type.UVarInt32());

    it('Success cases', () => {
        const testValues = generateUVarIntTestValues();
        
        for (const v of testValues) {
            expect(e.decode(e.validateEncode(v))).to.equal(v);
            expect(e.decode(e.encode(v))).to.equal(v);
        }
    });

    it('Edge cases', () => {
        // Test boundary values
        expect(e.decode(e.encode(0))).to.equal(0);
        expect(e.decode(e.encode(1))).to.equal(1);
        expect(e.decode(e.encode(4294967295))).to.equal(4294967295);
    });

    it('Encoded size matches expected uvarint32 byte lengths', () => {
        // +1 for LC header byte
        const cases: Array<[number, number]> = [
            [0, 1], [1, 1],
            [127, 1],
            [128, 2],
            [16383, 2],
            [16384, 3],
            [2097151, 3],
            [2097152, 4],
            [268435455, 4],
            [268435456, 5],
            [4294967295, 5],
        ];

        for (const [value, size] of cases) {
            const encoded1 = e.validateEncode(value);
            const encoded2 = e.encode(value);
            expect({
                value,
                encoded1Size: encoded1.length,
                encoded2Size: encoded2.length,
            }).to.deep.equal({
                value,
                encoded1Size: size,
                encoded2Size: size,
            });
        }
    });

    it('Fail cases', () => {
        // Test negative values (should fail for unsigned)
        expect(() => e.validateEncode(-1)).to.throw();
        expect(() => e.validateEncode(-2147483648)).to.throw();
        
        // Test values outside the valid range
        expect(() => e.validateEncode(4294967296)).to.throw();
        expect(() => e.validateEncode(Number.MAX_SAFE_INTEGER)).to.throw();
    });
});
