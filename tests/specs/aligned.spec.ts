import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Aligned', () => {
    describe('Aligned with 1-byte alignment', () => {
        const e = new Encoder(Type.Aligned(1, Type.Int32()));

        it('Success cases', () => {
            expect(e.decode(e.encode(42))).to.equal(42);
            expect(e.decode(e.encode(-100))).to.equal(-100);
            expect(e.decode(e.encode(0))).to.equal(0);
        });

        it('Encoding consistency', () => {
            const encoded = e.encode(123);
            expect(encoded.length).to.be.at.least(4); // At least 4 bytes for Int32
        });
    });

    describe('Aligned with 2-byte alignment', () => {
        const e = new Encoder(Type.Aligned(2, Type.Int16()));

        it('Success cases', () => {
            expect(e.decode(e.encode(1000))).to.equal(1000);
            expect(e.decode(e.encode(-2000))).to.equal(-2000);
            expect(e.decode(e.encode(0))).to.equal(0);
        });

        it('Encoding consistency', () => {
            const encoded = e.encode(123);
            expect(encoded.length).to.be.at.least(2); // At least 2 bytes for Int16
        });
    });

    describe('Aligned with 4-byte alignment', () => {
        const e = new Encoder(Type.Aligned(4, Type.Float32('le')));

        it('Success cases', () => {
            expect(e.decode(e.encode(3.14))).to.be.closeTo(3.14, 5);
            expect(e.decode(e.encode(-2.5))).to.be.closeTo(-2.5, 5);
            expect(e.decode(e.encode(0.0))).to.equal(0.0);
        });

        it('Encoding consistency', () => {
            const encoded = e.encode(3.14159);
            expect(encoded.length).to.be.at.least(4); // At least 4 bytes for Float32
        });
    });

    describe('Aligned with 8-byte alignment', () => {
        const e = new Encoder(Type.Aligned(8, Type.Float64('le')));

        it('Success cases', () => {
            expect(e.decode(e.encode(3.141592653589793))).to.be.closeTo(3.141592653589793, 14);
            expect(e.decode(e.encode(-2.718281828459045))).to.be.closeTo(-2.718281828459045, 14);
            expect(e.decode(e.encode(0.0))).to.equal(0.0);
        });

        it('Encoding consistency', () => {
            const encoded = e.encode(3.141592653589793);
            expect(encoded.length).to.be.at.least(8); // At least 8 bytes for Float64
        });
    });

    describe('Aligned with string', () => {
        const e = new Encoder(Type.Aligned(4, Type.String('utf8', Type.UVarInt32())));

        it('Success cases', () => {
            expect(e.decode(e.encode('hello'))).to.equal('hello');
            expect(e.decode(e.encode('world'))).to.equal('world');
            expect(e.decode(e.encode(''))).to.equal('');
        });

        it('Unicode strings', () => {
            expect(e.decode(e.encode('привет'))).to.equal('привет');
            expect(e.decode(e.encode('мир 😊'))).to.equal('мир 😊');
        });
    });

    describe('Aligned with buffer', () => {
        const e = new Encoder(Type.Aligned(8, Type.Buffer()));

        it('Success cases', () => {
            const buffer1 = Buffer.from([1, 2, 3, 4]);
            const buffer2 = Buffer.from([5, 6, 7, 8, 9, 10]);
            
            expect(e.decode(e.encode(buffer1))).to.deep.equal(buffer1);
            expect(e.decode(e.encode(buffer2))).to.deep.equal(buffer2);
        });

        it('Empty buffer', () => {
            const emptyBuffer = Buffer.from([]);
            expect(e.decode(e.encode(emptyBuffer))).to.deep.equal(emptyBuffer);
        });
    });

    describe('Aligned with array', () => {
        const e = new Encoder(Type.Aligned(4, Type.Array(Type.Int32(), Type.UVarInt32())));

        it('Success cases', () => {
            expect(e.decode(e.encode([1, 2, 3]))).to.deep.equal([1, 2, 3]);
            expect(e.decode(e.encode([]))).to.deep.equal([]);
        });

        it('Large arrays', () => {
            const largeArray = Array.from({ length: 100 }, (_, i) => i);
            expect(e.decode(e.encode(largeArray))).to.deep.equal(largeArray);
        });
    });

    describe('Aligned with struct', () => {
        const e = new Encoder(Type.Aligned(8, Type.Struct({
            id: Type.Int32(),
            name: Type.String('utf8', Type.UVarInt32()),
            active: Type.Bool()
        })));

        it('Success cases', () => {
            const testData = {
                id: 1,
                name: 'Test User',
                active: true
            };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Aligned with nested aligned types', () => {
        const e = new Encoder(Type.Aligned(4, Type.Aligned(2, Type.Int16())));

        it('Success cases', () => {
            expect(e.decode(e.encode(1000))).to.equal(1000);
            expect(e.decode(e.encode(-1000))).to.equal(-1000);
        });
    });

    describe('Aligned with optional', () => {
        const e = new Encoder(Type.Aligned(4, Type.Optional(Type.Int32())));

        it('Success cases - with value', () => {
            expect(e.decode(e.encode(42))).to.equal(42);
        });

        it('Success cases - null value', () => {
            expect(e.decode(e.encode(null))).to.equal(null);
        });
    });

    describe('Aligned with enum', () => {
        const e = new Encoder(Type.Aligned(2, Type.Enum(['red', 'green', 'blue'], Type.UVarInt32())));

        it('Success cases', () => {
            expect(e.decode(e.encode('red'))).to.equal('red');
            expect(e.decode(e.encode('green'))).to.equal('green');
            expect(e.decode(e.encode('blue'))).to.equal('blue');
        });
    });

    describe('Aligned with one_of', () => {
        const e = new Encoder(Type.Aligned(4, Type.OneOf({
            stringField: Type.String('utf8', Type.UVarInt32()),
            numberField: Type.Int32()
        })));

        it('Success cases - string field', () => {
            expect(e.decode(e.encode({ stringField: 'test' }))).to.deep.equal({ stringField: 'test' });
        });

        it('Success cases - number field', () => {
            expect(e.decode(e.encode({ numberField: 42 }))).to.deep.equal({ numberField: 42 });
        });
    });

    describe('Aligned with low_cardinality', () => {
        const e = new Encoder(Type.Aligned(2, Type.LowCardinality(Type.String('utf8', Type.UVarInt32()))));

        it('Success cases', () => {
            expect(e.decode(e.encode('test'))).to.equal('test');
            expect(e.decode(e.encode('test'))).to.equal('test'); // repeated value
        });
    });

    describe('Aligned with const', () => {
        const e = new Encoder(Type.Aligned(4, Type.Const('constant value')));

        it('Success cases', () => {
            expect(e.decode(e.encode('constant value'))).to.equal('constant value');
        });
    });

    describe('Different alignment sizes', () => {
        const alignments = [1, 2, 3, 4, 5, 6, 7, 8] as const;

        for (const align of alignments) {
            describe(`Aligned with ${align}-byte alignment`, () => {
                const e = new Encoder(Type.Aligned(align, Type.Int32()));

                it('Success cases', () => {
                    expect(e.decode(e.encode(42))).to.equal(42);
                    expect(e.decode(e.encode(-42))).to.equal(-42);
                });

                it('Encoding consistency', () => {
                    const encoded = e.encode(123);
                    expect(encoded.length).to.be.at.least(4); // At least 4 bytes for Int32
                });
            });
        }
    });

    describe('Aligned edge cases', () => {
        const e = new Encoder(Type.Aligned(8, Type.Int8()));

        it('Small data type with large alignment', () => {
            expect(e.decode(e.encode(127))).to.equal(127);
            expect(e.decode(e.encode(-128))).to.equal(-128);
        });
    });
});
