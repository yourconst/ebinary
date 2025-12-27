import { Encoder, Type } from '../../../src';
import type { SchemaInt } from '../../../src/types/types';
import { expect } from 'chai';

function generateSeries(min: number, max: number) {
    const result: number[] = [];

    for (let i = min; i <= max; ++i) {
        result.push(i);
    }

    return result;
}

function generateSuccessValues(min: number, max: number) {
    const result: number[] = [];

    result.push(...generateSeries(min, Math.min(max, min + 128)));
    const middle = Math.trunc((max + min) / 2);
    result.push(...generateSeries(
        Math.max(min, middle - 128),
        Math.min(max, middle + 128),
    ));
    result.push(...generateSeries(Math.max(min, max - 128), max));

    return result;
}

function generateFailValues(min: number, max: number) {
    const result: number[] = [];

    result.push(...generateSeries(min*2-128, min*2-1));
    result.push(...generateSeries(min-128, min-1));
    result.push(...generateSeries(max+1, max+128));
    result.push(...generateSeries(max*2+1, max*2+128));

    return result;
}

function main<S extends SchemaInt>(encoder: Encoder<S>, min: number, max: number) {
    const e = encoder as unknown as Encoder<'int8'>;

    it('Success cases', () => {
        for (const v of generateSuccessValues(min, max)) {
            expect(e.decode(e.validateEncode(v))).to.deep.equal(v);
            expect(e.decode(e.encode(v))).to.deep.equal(v);

            const ev = v < 0 ? v + 1 : v;
            
            if (v < max) {
                expect(e.decode(e.encode(v + 0.1))).to.deep.equal(ev);
                expect(e.decode(e.encode(v + 0.5))).to.deep.equal(ev);
                expect(e.decode(e.encode(v + 0.9))).to.deep.equal(ev);
            } else {
                expect(() => e.validateEncode(v + 0.1)).to.throw();
                expect(() => e.validateEncode(v + 0.5)).to.throw();
                expect(() => e.validateEncode(v + 0.9)).to.throw();
            }
        }
    });

    it('Fail cases', () => {
        for (const v of generateFailValues(min, max)) {
            expect(() => e.validateEncode(v)).to.throw();
            // expect(() => e.encode(v)).to.throw();
        }

        for (const v of generateSuccessValues(min, max)) {
            expect(() => e.validateEncode(v + 0.1)).to.throw();
            expect(() => e.validateEncode(v + 0.5)).to.throw();
            expect(() => e.validateEncode(v + 0.9)).to.throw();
        }
    });
}

describe('Int8', () => {
    main(new Encoder(Type.Int8()), -128, 127);
});

describe('UInt8', () => {
    main(new Encoder(Type.UInt8()), 0, 255);
});

describe('Int16 LE', () => {
    main(new Encoder(Type.Int16('le')), -(2**15), (2**15) - 1);
});

describe('Int16 BE', () => {
    main(new Encoder(Type.Int16('be')), -(2**15), (2**15) - 1);
});

describe('UInt16 LE', () => {
    main(new Encoder(Type.UInt16('le')), 0, (2**16) - 1);
});

describe('UInt16 BE', () => {
    main(new Encoder(Type.UInt16('be')), 0, (2**16) - 1);
});

describe('Int32 LE', () => {
    main(new Encoder(Type.Int32('le')), -(2**31), (2**31) - 1);
});

describe('Int32 BE', () => {
    main(new Encoder(Type.Int32('be')), -(2**31), (2**31) - 1);
});

describe('UInt32 LE', () => {
    main(new Encoder(Type.UInt32('le')), 0, (2**32) - 1);
});

describe('UInt32 BE', () => {
    main(new Encoder(Type.UInt32('be')), 0, (2**32) - 1);
});
