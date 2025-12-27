import { Encoder, Type } from '../../../src';
import type { SchemaFloat } from '../../../src/types/types';
import { expect } from 'chai';

function generateFloatTestValues() {
    return [
        0,
        1,
        -1,
        0.5,
        -0.5,
        1.5,
        -1.5,
        3.14159,
        -3.14159,
        1e10,
        -1e10,
        1e-10,
        -1e-10,
        Number.MAX_VALUE,
        -Number.MAX_VALUE,
        Number.MIN_VALUE,
        -Number.MIN_VALUE,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
    ];
}

const toFloat32 = Math.fround;

function main<S extends SchemaFloat = SchemaFloat>(encoder: Encoder<S>) {
    const e = encoder as unknown as Encoder<SchemaFloat>;
    const typeName = e.getSchema();

    it('Success cases', () => {
        const testValues = generateFloatTestValues();
        
        for (const v of testValues) {
            if (Number.isNaN(v)) {
                // NaN should encode/decode to NaN
                expect(Number.isNaN(e.decode(e.validateEncode(v)))).to.equal(true);
                expect(Number.isNaN(e.decode(e.encode(v)))).to.equal(true);
            } else if (typeName.includes('32')) {
                // Compare as float32 on both sides
                expect(e.decode(e.validateEncode(v))).to.equal(toFloat32(v));
                expect(e.decode(e.encode(v))).to.equal(toFloat32(v));
            } else {
                // Float64 can be strict equal for these values
                expect(e.decode(e.validateEncode(v))).to.equal(v);
                expect(e.decode(e.encode(v))).to.equal(v);
            }
        }
    });

    it('Edge cases', () => {
        if (typeName.includes('32')) {
            // Compare both sides in float32
            expect(e.decode(e.encode(1e-45))).to.equal(toFloat32(1e-45));
            expect(e.decode(e.encode(-1e-45))).to.equal(toFloat32(-1e-45));
            expect(e.decode(e.encode(1e38))).to.equal(toFloat32(1e38));
            expect(e.decode(e.encode(-1e38))).to.equal(toFloat32(-1e38));
        } else {
            // Keep strict closeness for float64
            expect(e.decode(e.encode(1e-45))).to.be.closeTo(1e-45, 10);
            expect(e.decode(e.encode(-1e-45))).to.be.closeTo(-1e-45, 10);
            expect(e.decode(e.encode(1e38))).to.be.closeTo(1e38, 10);
            expect(e.decode(e.encode(-1e38))).to.be.closeTo(-1e38, 10);
        }
    });

    it('Precision tests', () => {
        const testValue = 3.141592653589793;
        const decoded = e.decode(e.encode(testValue));
        
        if (typeName.includes('32')) {
            expect(decoded).to.equal(toFloat32(testValue));
        } else {
            expect(decoded).to.be.closeTo(testValue, 14);
        }
    });

    it('Special values', () => {
        // Test infinity
        expect(e.decode(e.encode(Infinity))).to.equal(Infinity);
        expect(e.decode(e.encode(-Infinity))).to.equal(-Infinity);
        
        // Test zero
        expect(e.decode(e.encode(0))).to.equal(0);
        expect(e.decode(e.encode(-0))).to.equal(-0);
    });
}

describe('Float32 LE', () => {
    main(new Encoder(Type.Float32('le')));
});

describe('Float32 BE', () => {
    main(new Encoder(Type.Float32('be')));
});

describe('Float64 LE', () => {
    main(new Encoder(Type.Float64('le')));
});

describe('Float64 BE', () => {
    main(new Encoder(Type.Float64('be')));
});
