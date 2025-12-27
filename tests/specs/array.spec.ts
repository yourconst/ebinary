import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Array', () => {
    describe('Array of numbers with UVarInt32 length', () => {
        const e = new Encoder(Type.Array(Type.Int32(), Type.UVarInt32()));

        it('Success cases', () => {
            // Empty array
            expect(e.decode(e.encode([]))).to.deep.equal([]);
            
            // Single element
            expect(e.decode(e.encode([42]))).to.deep.equal([42]);
            
            // Multiple elements
            expect(e.decode(e.encode([1, 2, 3, 4, 5]))).to.deep.equal([1, 2, 3, 4, 5]);
            
            // Negative numbers
            expect(e.decode(e.encode([-1, -2, -3]))).to.deep.equal([-1, -2, -3]);
            
            // Mixed positive and negative
            expect(e.decode(e.encode([-100, 0, 100, -200, 200]))).to.deep.equal([-100, 0, 100, -200, 200]);
        });

        it('Large arrays', () => {
            // Large array
            const largeArray = Array.from({ length: 1000 }, (_, i) => i - 500);
            expect(e.decode(e.encode(largeArray))).to.deep.equal(largeArray);
        });

        it('Edge cases', () => {
            // Array with boundary values
            const boundaryArray = [2147483647, -2147483648, 0];
            expect(e.decode(e.encode(boundaryArray))).to.deep.equal(boundaryArray);
        });
    });

    describe('Array of strings with UInt8 length', () => {
        const e = new Encoder(Type.Array(Type.String('utf8', Type.UVarInt32()), Type.UInt8()));

        it('Success cases', () => {
            // Empty array
            expect(e.decode(e.encode([]))).to.deep.equal([]);
            
            // Single string
            expect(e.decode(e.encode(['hello']))).to.deep.equal(['hello']);
            
            // Multiple strings
            expect(e.decode(e.encode(['hello', 'world', 'test']))).to.deep.equal(['hello', 'world', 'test']);
            
            // Unicode strings
            expect(e.decode(e.encode(['привет', 'мир', '😊']))).to.deep.equal(['привет', 'мир', '😊']);
        });

        it('Length limits', () => {
            // Test maximum length for UInt8 (255)
            const maxArray = Array.from({ length: 255 }, (_, i) => `item${i}`);
            expect(e.decode(e.encode(maxArray))).to.deep.equal(maxArray);
        });

        it('Fail cases', () => {
            // Test exceeding UInt8 limit
            const tooLargeArray = Array.from({ length: 256 }, (_, i) => `item${i}`);
            expect(() => e.validateEncode(tooLargeArray)).to.throw();
        });
    });

    describe('Array of booleans with UInt16 length', () => {
        const e = new Encoder(Type.Array(Type.Bool(), Type.UInt16()));

        it('Success cases', () => {
            // Empty array
            expect(e.decode(e.encode([]))).to.deep.equal([]);
            
            // Single boolean
            expect(e.decode(e.encode([true]))).to.deep.equal([true]);
            expect(e.decode(e.encode([false]))).to.deep.equal([false]);
            
            // Multiple booleans
            expect(e.decode(e.encode([true, false, true, false]))).to.deep.equal([true, false, true, false]);
            
            // Large boolean array
            const largeBoolArray = Array.from({ length: 1000 }, (_, i) => i % 2 === 0);
            expect(e.decode(e.encode(largeBoolArray))).to.deep.equal(largeBoolArray);
        });
    });

    describe('Array of arrays (nested)', () => {
        const e = new Encoder(Type.Array(
            Type.Array(Type.Int32(), Type.UVarInt32()),
            Type.UVarInt32()
        ));

        it('Success cases', () => {
            // Empty nested array
            expect(e.decode(e.encode([]))).to.deep.equal([]);
            
            // Single nested array
            expect(e.decode(e.encode([[1, 2, 3]]))).to.deep.equal([[1, 2, 3]]);
            
            // Multiple nested arrays
            expect(e.decode(e.encode([[1, 2], [3, 4], [5, 6]]))).to.deep.equal([[1, 2], [3, 4], [5, 6]]);
            
            // Mixed sizes
            expect(e.decode(e.encode([[1], [2, 3], [4, 5, 6]]))).to.deep.equal([[1], [2, 3], [4, 5, 6]]);
        });
    });

    describe('Array of buffers', () => {
        const e = new Encoder(Type.Array(Type.Buffer(), Type.UVarInt32()));

        it('Success cases', () => {
            // Empty array
            expect(e.decode(e.encode([]))).to.deep.equal([]);
            
            // Single buffer
            const buffer1 = Buffer.from([1, 2, 3]);
            expect(e.decode(e.encode([buffer1]))).to.deep.equal([buffer1]);
            
            // Multiple buffers
            const buffer2 = Buffer.from([4, 5, 6]);
            const buffer3 = Buffer.from([7, 8, 9]);
            expect(e.decode(e.encode([buffer1, buffer2, buffer3]))).to.deep.equal([buffer1, buffer2, buffer3]);
            
            // Empty buffers
            const emptyBuffer = Buffer.from([]);
            expect(e.decode(e.encode([emptyBuffer, buffer1]))).to.deep.equal([emptyBuffer, buffer1]);
        });
    });
});
