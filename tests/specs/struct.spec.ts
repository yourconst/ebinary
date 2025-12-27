import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Struct', () => {
    describe('Simple struct with fields', () => {
        const e = new Encoder(Type.Struct({
            id: Type.Int32(),
            name: Type.String('utf8', Type.UVarInt32()),
            active: Type.Bool(),
            score: Type.Float64('le')
        }));

        it('Success cases', () => {
            const testData = {
                id: 123,
                name: 'John Doe',
                active: true,
                score: 95.5
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Different field values', () => {
            const testCases = [
                {
                    id: 0,
                    name: '',
                    active: false,
                    score: 0.0
                },
                {
                    id: -1,
                    name: 'Test User',
                    active: true,
                    score: -100.0
                },
                {
                    id: 2147483647,
                    name: 'Very Long Name That Contains Many Characters',
                    active: false,
                    score: 3.14159
                }
            ];

            for (const testData of testCases) {
                expect(e.decode(e.encode(testData))).to.deep.equal(testData);
            }
        });

        it('Unicode strings', () => {
            const testData = {
                id: 456,
                name: 'Пользователь 😊',
                active: true,
                score: 99.9
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Struct with simple fields', () => {
        const e = new Encoder(Type.Struct({
            id: Type.Int32(),
            name: Type.String('utf8', Type.UVarInt32()),
            active: Type.Bool()
        }));

        it('Success cases', () => {
            const testData = {
                id: 789,
                name: 'Simple User',
                active: false
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Nested struct', () => {
        const e = new Encoder(Type.Struct({
            user: Type.Struct({
                id: Type.Int32(),
                name: Type.String('utf8', Type.UVarInt32())
            }),
            settings: Type.Struct({
                theme: Type.String('ascii', Type.UInt8()),
                notifications: Type.Bool()
            })
        }));

        it('Success cases', () => {
            const testData = {
                user: {
                    id: 100,
                    name: 'Nested User'
                },
                settings: {
                    theme: 'dark',
                    notifications: true
                }
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Struct with arrays', () => {
        const e = new Encoder(Type.Struct({
            id: Type.Int32(),
            tags: Type.Array(Type.String('utf8', Type.UVarInt32()), Type.UVarInt32()),
            scores: Type.Array(Type.Float32('le'), Type.UInt8())
        }));

        it('Success cases', () => {
            const testData = {
                id: 200,
                tags: ['tag1', 'tag2', 'tag3'],
                scores: [85.5, 92.0, 78.5]
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Empty arrays', () => {
            const testData = {
                id: 201,
                tags: [],
                scores: []
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Struct with optional fields', () => {
        const e = new Encoder(Type.Struct({
            id: Type.Int32(),
            name: Type.String('utf8', Type.UVarInt32()),
            description: Type.Optional(Type.String('utf8', Type.UVarInt32())),
            metadata: Type.Optional(Type.Struct({
                created: Type.Int64('le'),
                updated: Type.Int64('le')
            }))
        }));

        it('Success cases with all fields', () => {
            const testData = {
                id: 300,
                name: 'Full User',
                description: 'A user with all fields',
                metadata: {
                    created: BigInt(1234567890),
                    updated: BigInt(9876543210)
                }
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases with optional fields as null', () => {
            const testData = {
                id: 301,
                name: 'Partial User',
                description: null,
                metadata: null
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Success cases with optional fields as undefined', () => {
            const testData = {
                id: 302,
                name: 'Minimal User',
                description: null,
                metadata: null
            };

            const encoded = e.encode(testData);
            const decoded = e.decode(encoded);
            
            expect(decoded.id).to.equal(302);
            expect(decoded.name).to.equal('Minimal User');
            expect(decoded.description).to.equal(null);
            expect(decoded.metadata).to.equal(null);
        });
    });

    describe('Empty struct', () => {
        const e = new Encoder(Type.Struct({}));

        it('Success cases', () => {
            const testData = {};
            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });

    describe('Struct with buffers', () => {
        const e = new Encoder(Type.Struct({
            id: Type.Int32(),
            data: Type.Buffer(),
            checksum: Type.UInt32('le')
        }));

        it('Success cases', () => {
            const testData = {
                id: 400,
                data: Buffer.from([1, 2, 3, 4, 5]),
                checksum: 0x12345678
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });

        it('Empty buffer', () => {
            const testData = {
                id: 401,
                data: Buffer.from([]),
                checksum: 0
            };

            expect(e.decode(e.encode(testData))).to.deep.equal(testData);
        });
    });
});
