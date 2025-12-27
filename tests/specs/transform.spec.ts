import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Transform', () => {
    describe('Transform with string to string conversion', () => {
        const e = new Encoder(Type.Transform(
            Type.String('utf8', Type.UVarInt32()),
            {
                encode: (value: string) => value.toUpperCase(),
                decode: (value: string) => value.toLowerCase()
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('hello'))).to.equal('hello');
            expect(e.decode(e.encode('world'))).to.equal('world');
            expect(e.decode(e.encode('test'))).to.equal('test');
        });

        it('Edge cases', () => {
            expect(e.decode(e.encode('HELLO'))).to.equal('hello');
            expect(e.decode(e.encode('WORLD'))).to.equal('world');
        });
    });

    describe('Transform with number to number conversion', () => {
        const e = new Encoder(Type.Transform(
            Type.Int32(),
            {
                encode: (value: number) => value * 2,
                decode: (value: number) => value / 2
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode(123))).to.equal(123);
            expect(e.decode(e.encode(0))).to.equal(0);
            expect(e.decode(e.encode(-456))).to.equal(-456);
        });
    });

    describe('Transform with object to string conversion', () => {
        const e = new Encoder(Type.Transform(
            Type.String('utf8', Type.UVarInt32()),
            {
                encode: (value: { id: number; name: string }) => `${value.id}:${value.name}`,
                decode: (value: string) => {
                    const [id, name] = value.split(':');
                    return { id: parseInt(id, 10), name };
                }
            }
        ));

        it('Success cases', () => {
            const testData = { id: 1, name: 'John' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Different values', () => {
            const testData = { id: 42, name: 'Jane' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Transform with simple number transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.Int32(),
            {
                encode: (value: number) => value * 2,
                decode: (value: number) => value / 2
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode(1))).to.equal(1);
            expect(e.decode(e.encode(10))).to.equal(10);
        });

        it('Zero value', () => {
            expect(e.decode(e.encode(0))).to.equal(0);
        });
    });

    describe('Transform with boolean inversion', () => {
        const e = new Encoder(Type.Transform(
            Type.Bool(),
            {
                encode: (value: boolean) => !value,
                decode: (value: boolean) => !value
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode(true))).to.equal(true);
            expect(e.decode(e.encode(false))).to.equal(false);
        });
    });

    describe('Transform with date conversion', () => {
        const e = new Encoder(Type.Transform(
            Type.Int64('le'),
            {
                encode: (value: Date) => BigInt(value.getTime()),
                decode: (value: bigint) => new Date(Number(value))
            }
        ));

        it('Success cases', () => {
            const testDate = new Date('2023-01-01T00:00:00Z');
            const result = e.decode(e.encode(testDate));
            expect(result.getTime()).to.equal(testDate.getTime());
        });

        it('Different dates', () => {
            const testDate = new Date('2023-12-31T23:59:59Z');
            const result = e.decode(e.encode(testDate));
            expect(result.getTime()).to.equal(testDate.getTime());
        });
    });

    describe('Transform with nested object transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.Struct({
                id: Type.Int32(),
                name: Type.String('utf8', Type.UVarInt32())
            }),
            {
                encode: (value: { id: number; name: string; extra?: string }) => <any> ({
                    id: value.id,
                    name: value.name
                }),
                decode: (value: { id: number; name: string }) => ({
                    id: value.id,
                    name: value.name,
                    extra: 'transformed'
                })
            }
        ));

        it('Success cases', () => {
            const input = { id: 1, name: 'Test', extra: 'ignored' };
            const expected = { id: 1, name: 'Test', extra: 'transformed' };
            expect(e.decode(e.encode(input))).to.deep.equal(expected);
        });
    });

    describe('Transform with enum-like conversion', () => {
        const e = new Encoder(Type.Transform(
            Type.String('ascii', Type.UInt8()),
            {
                encode: (value: 'active' | 'inactive' | 'pending') => {
                    const map = { active: 'A', inactive: 'I', pending: 'P' };
                    return map[value];
                },
                decode: (value: string) => {
                    const map = { 'A': 'active', 'I': 'inactive', 'P': 'pending' };
                    return map[value as keyof typeof map];
                }
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('active'))).to.equal('active');
            expect(e.decode(e.encode('inactive'))).to.equal('inactive');
            expect(e.decode(e.encode('pending'))).to.equal('pending');
        });
    });

    describe('Transform with buffer transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.Buffer(),
            {
                encode: (value: Buffer) => Buffer.from(value.map(x => x ^ 0xFF)),
                decode: (value: Buffer) => Buffer.from(value.map(x => x ^ 0xFF))
            }
        ));

        it('Success cases', () => {
            const testBuffer = Buffer.from([1, 2, 3, 4, 5]);
            expect(e.decode(e.encode(testBuffer))).to.deep.equal(testBuffer);
        });

        it('Empty buffer', () => {
            const emptyBuffer = Buffer.from([]);
            expect(e.decode(e.encode(emptyBuffer))).to.deep.equal(emptyBuffer);
        });
    });

    describe('Transform with complex nested transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.Array(Type.Struct({
                id: Type.Int32(),
                value: Type.String('utf8', Type.UVarInt32())
            }), Type.UVarInt32()),
            {
                encode: (value: Array<{ id: number; value: string; metadata?: any }>) => 
                    <any> value.map(item => ({ id: item.id, value: item.value })),
                decode: (value: Array<{ id: number; value: string }>) => 
                    value.map(item => ({ 
                        id: item.id, 
                        value: item.value, 
                        metadata: { processed: true } 
                    }))
            }
        ));

        it('Success cases', () => {
            const input = [
                { id: 1, value: 'test1', metadata: 'ignored' },
                { id: 2, value: 'test2', metadata: 'ignored' }
            ];
            const expected = [
                { id: 1, value: 'test1', metadata: { processed: true } },
                { id: 2, value: 'test2', metadata: { processed: true } }
            ];
            expect(e.decode(e.encode(input))).to.deep.equal(expected);
        });
    });

    describe('Transform with caching enabled', () => {
        const e = new Encoder(Type.Transform(
            Type.String('utf8', Type.UVarInt32()),
            {
                encode: (value: string) => value.toUpperCase(),
                decode: (value: string) => value.toLowerCase(),
                cache: true
            }
        ));

        it('Success cases', () => {
            expect(e.decode(e.encode('hello'))).to.equal('hello');
            expect(e.decode(e.encode('WORLD'))).to.equal('world');
        });

        it('Caching behavior', () => {
            // Same input should produce same output (cached)
            const result1 = e.decode(e.encode('test'));
            const result2 = e.decode(e.encode('test'));
            expect(result1).to.equal(result2);
        });
    });

    describe('Transform with one_of transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.OneOf({
                stringField: Type.String('utf8', Type.UVarInt32()),
                numberField: Type.Int32()
            }),
            {
                encode: (value: { type: string; data: any }): any => {
                    if (value.type === 'string') {
                        return { stringField: value.data };
                    } else {
                        return { numberField: value.data };
                    }
                },
                decode: (value: any) => {
                    if ('stringField' in value) {
                        return { type: 'string', data: value.stringField };
                    } else {
                        return { type: 'number', data: value.numberField };
                    }
                }
            }
        ));

        it('Success cases - string field', () => {
            const input = { type: 'string', data: 'hello' };
            const expected = { type: 'string', data: 'hello' };
            expect(e.decode(e.encode(input))).to.deep.equal(expected);
        });

        it('Success cases - number field', () => {
            const input = { type: 'number', data: 42 };
            const expected = { type: 'number', data: 42 };
            expect(e.decode(e.encode(input))).to.deep.equal(expected);
        });
    });

    describe('Transform with optional transformation', () => {
        const e = new Encoder(Type.Transform(
            Type.Optional(Type.String('utf8', Type.UVarInt32())),
            {
                encode: (value: string | null) => value === null ? 'NULL' : value,
                decode: (value: string) => value === 'NULL' ? null : value
            }
        ));

        it('Success cases - with value', () => {
            expect(e.decode(e.encode('test'))).to.equal('test');
        });

        it('Success cases - null value', () => {
            expect(e.decode(e.encode(null))).to.equal(null);
        });
    });

    describe('Transform edge cases', () => {
        const e = new Encoder(Type.Transform(
            Type.Int32(),
            {
                encode: (value: number) => value,
                decode: (value: number) => value
            }
        ));

        it('Identity transformation', () => {
            expect(e.decode(e.encode(42))).to.equal(42);
            expect(e.decode(e.encode(0))).to.equal(0);
            expect(e.decode(e.encode(-1))).to.equal(-1);
        });
    });
});
