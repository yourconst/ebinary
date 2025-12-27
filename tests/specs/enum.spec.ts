import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Enum', () => {
    describe('String enum with UVarInt32 index', () => {
        const e = new Encoder(Type.Enum(['red', 'green', 'blue'], Type.UVarInt32()));

        it('Success cases', () => {
            expect(e.decode(e.encode('red'))).to.equal('red');
            expect(e.decode(e.encode('green'))).to.equal('green');
            expect(e.decode(e.encode('blue'))).to.equal('blue');
        });

        it('Index order', () => {
            // Test that indices are assigned correctly
            const redEncoded = e.encode('red');
            const greenEncoded = e.encode('green');
            const blueEncoded = e.encode('blue');
            
            // red should be index 0, green index 1, blue index 2
            expect(redEncoded[0]).to.equal(0);
            expect(greenEncoded[0]).to.equal(1);
            expect(blueEncoded[0]).to.equal(2);
        });
    });

    describe('Number enum with UInt16 index', () => {
        const e = new Encoder(Type.Enum([1, 2, 3, 4, 5], Type.UInt16()));

        it('Success cases', () => {
            expect(e.decode(e.encode(1))).to.equal(1);
            expect(e.decode(e.encode(2))).to.equal(2);
            expect(e.decode(e.encode(3))).to.equal(3);
            expect(e.decode(e.encode(4))).to.equal(4);
            expect(e.decode(e.encode(5))).to.equal(5);
        });
    });

    describe('Mixed type enum', () => {
        const e = new Encoder(Type.Enum(['string', 42], Type.UVarInt32()));

        it('Success cases', () => {
            expect(e.decode(e.encode('string'))).to.equal('string');
            expect(e.decode(e.encode(42))).to.equal(42);
        });
    });

    describe('Large enum with UInt16 index', () => {
        const largeEnum = Array.from({ length: 1000 }, (_, i) => `item${i}`);
        const e = new Encoder(Type.Enum(largeEnum, Type.UInt16()));

        it('Success cases', () => {
            expect(e.decode(e.encode('item0'))).to.equal('item0');
            expect(e.decode(e.encode('item500'))).to.equal('item500');
            expect(e.decode(e.encode('item999'))).to.equal('item999');
        });

        it('Index boundaries', () => {
            // Test first and last items
            const firstEncoded = e.encode('item0');
            const lastEncoded = e.encode('item999');
            
            expect(firstEncoded[0]).to.equal(0);
            expect(lastEncoded[0]).to.equal(231); // 999 in UInt16 LE
            expect(lastEncoded[1]).to.equal(3);   // 999 >> 8
        });
    });

    describe('String enum with different values', () => {
        const stringEnum = ['user', 'admin', 'guest'];
        const e = new Encoder(Type.Enum(stringEnum, Type.UVarInt32()));

        it('Success cases', () => {
            expect(e.decode(e.encode('user'))).to.equal('user');
            expect(e.decode(e.encode('admin'))).to.equal('admin');
            expect(e.decode(e.encode('guest'))).to.equal('guest');
        });
    });

    describe('Empty enum', () => {
        it('Should throw error while creating encoder', () => {
            expect(() => new Encoder(Type.Enum([], Type.UVarInt32()))).to.throw();
        });
    });

    describe('Single value enum', () => {
        const e = new Encoder(Type.Enum(['only'], Type.UVarInt32()));

        it('Success cases', () => {
            expect(e.decode(e.encode('only'))).to.equal('only');
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode('not-only')).to.throw();
            expect(() => e.validateEncode(42 as any)).to.throw();
        });
    });

    describe('Enum with duplicate values', () => {
        const e = new Encoder(Type.Enum(['a', 'b', 'a'], Type.UVarInt32()));

        it('Success cases', () => {
            // First occurrence should be used
            expect(e.decode(e.encode('a'))).to.equal('a');
            expect(e.decode(e.encode('b'))).to.equal('b');
        });

        it('Index behavior', () => {
            const aEncoded = e.encode('a');
            const bEncoded = e.encode('b');
            
            // 'a' should be index 0 (first occurrence)
            expect(aEncoded[0]).to.equal(0);
            // 'b' should be index 1
            expect(bEncoded[0]).to.equal(1);
        });
    });

    describe('Enum with special values', () => {
        const e = new Encoder(Type.Enum([0, -1, Infinity, -Infinity, NaN], Type.UVarInt32()));

        it('Success cases', () => {
            expect(e.decode(e.encode(0))).to.equal(0);
            expect(e.decode(e.encode(-1))).to.equal(-1);
            expect(e.decode(e.encode(Infinity))).to.equal(Infinity);
            expect(e.decode(e.encode(-Infinity))).to.equal(-Infinity);
            
            // NaN should be handled specially
            const encoded = e.encode(NaN);
            const decoded = e.decode(encoded);
            expect(Number.isNaN(decoded)).to.equal(true);
        });
    });
});
