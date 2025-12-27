import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('OneOf', () => {
    describe('OneOf with different field types', () => {
        const e = new Encoder(Type.OneOf({
            stringField: Type.String('utf8', Type.UVarInt32()),
            numberField: Type.Int32(),
            boolField: Type.Bool(),
            bufferField: Type.Buffer()
        }));

        it('Success cases - string field', () => {
            const testData = { stringField: 'hello world' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - number field', () => {
            const testData = { numberField: 42 };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - bool field', () => {
            const testData = { boolField: true };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - buffer field', () => {
            const testData = { bufferField: Buffer.from([1, 2, 3, 4]) };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Multiple fields (should only encode first one)', () => {
            const testData = { 
                stringField: 'hello', 
                numberField: 42 
            };
            const encoded = e.encode(testData);
            const decoded = e.decode(encoded);
            
            // Only one field should be present in the result
            expect(Object.keys(decoded)).to.have.length(1);
        });
    });

    describe('OneOf with simple fields', () => {
        const e = new Encoder(Type.OneOf({
            first: Type.String('ascii', Type.UInt8()),
            second: Type.Int16('le'),
            third: Type.Float64('be')
        }));

        it('Success cases - first field', () => {
            const testData = { first: 'test' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - second field', () => {
            const testData = { second: 1000 };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - third field', () => {
            const testData = { third: 3.14 };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('OneOf with nested structs', () => {
        const e = new Encoder(Type.OneOf({
            user: Type.Struct({
                id: Type.Int32(),
                name: Type.String('utf8', Type.UVarInt32())
            }),
            admin: Type.Struct({
                id: Type.Int32(),
                name: Type.String('utf8', Type.UVarInt32()),
                permissions: Type.Array(Type.String('ascii', Type.UInt8()), Type.UVarInt32())
            })
        }));

        it('Success cases - user struct', () => {
            const testData = {
                user: {
                    id: 1,
                    name: 'John Doe'
                }
            };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - admin struct', () => {
            const testData = {
                admin: {
                    id: 2,
                    name: 'Admin User',
                    permissions: ['read', 'write', 'delete']
                }
            };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('OneOf with arrays', () => {
        const e = new Encoder(Type.OneOf({
            numbers: Type.Array(Type.Int32(), Type.UVarInt32()),
            strings: Type.Array(Type.String('utf8', Type.UVarInt32()), Type.UInt8()),
            booleans: Type.Array(Type.Bool(), Type.UInt16())
        }));

        it('Success cases - numbers array', () => {
            const testData = { numbers: [1, 2, 3, 4, 5] };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - strings array', () => {
            const testData = { strings: ['hello', 'world', 'test'] };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - booleans array', () => {
            const testData = { booleans: [true, false, true, false] };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Empty arrays', () => {
            const testData = { numbers: [] };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('OneOf with optional fields', () => {
        const e = new Encoder(Type.OneOf({
            required: Type.String('utf8', Type.UVarInt32()),
            optional: Type.Optional(Type.String('utf8', Type.UVarInt32())),
            withDefault: Type.Optional(Type.String('utf8', Type.UVarInt32()))
        }));

        it('Success cases - required field', () => {
            const testData = { required: 'required value' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - optional field with value', () => {
            const testData = { optional: 'optional value' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - optional field as null', () => {
            const testData = { optional: null };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('OneOf with enums', () => {
        const e = new Encoder(Type.OneOf({
            color: Type.Enum(['red', 'green', 'blue'], Type.UVarInt32()),
            status: Type.Enum(['active', 'inactive', 'pending'], Type.UInt16()),
            priority: Type.Enum([1, 2, 3, 4, 5], Type.UVarInt32())
        }));

        it('Success cases - color enum', () => {
            const testData = { color: 'red' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - status enum', () => {
            const testData = { status: 'active' };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - priority enum', () => {
            const testData = { priority: 3 };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('OneOf with mixed complex types', () => {
        const e = new Encoder(Type.OneOf({
            simple: Type.Int32(),
            complex: Type.Struct({
                id: Type.Int32(),
                data: Type.Array(Type.String('utf8', Type.UVarInt32()), Type.UVarInt32()),
                metadata: Type.Optional(Type.Struct({
                    created: Type.Int64('le'),
                    updated: Type.Int64('le')
                }))
            })
        }));

        it('Success cases - simple type', () => {
            const testData = { simple: 42 };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - complex type', () => {
            const testData = {
                complex: {
                    id: 100,
                    data: ['item1', 'item2', 'item3'],
                    metadata: {
                        created: BigInt(1234567890),
                        updated: BigInt(9876543210)
                    }
                }
            };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases - complex type with null metadata', () => {
            const testData = {
                complex: {
                    id: 101,
                    data: [],
                    metadata: null
                }
            };
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Empty OneOf', () => {
        it('Should throw error while creating encoder', () => {
            expect(() => new Encoder(Type.OneOf({}))).to.throw();
        });
    });
});
