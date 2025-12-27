import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Const', () => {
    describe('String constants', () => {
        const e = new Encoder(Type.Const('hello world'));

        it('Success cases', () => {
            expect(e.decode(e.encode('hello world'))).to.equal('hello world');
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode('different string' as any)).to.throw();
            expect(() => e.validateEncode('' as any)).to.throw();
            expect(() => e.validateEncode(null as any)).to.throw();
            expect(() => e.validateEncode(undefined as any)).to.throw();
        });
    });

    describe('Number constants', () => {
        const e = new Encoder(Type.Const(42));

        it('Success cases', () => {
            expect(e.decode(e.encode(42))).to.equal(42);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode(43)).to.throw();
            expect(() => e.validateEncode(0)).to.throw();
            expect(() => e.validateEncode(-42)).to.throw();
            expect(() => e.validateEncode('42' as any)).to.throw();
        });
    });

    describe('Boolean constants', () => {
        describe('True constant', () => {
            const e = new Encoder(Type.Const(true));

            it('Success cases', () => {
                expect(e.decode(e.encode(true))).to.equal(true);
            });

            it('Fail cases', () => {
                expect(() => e.validateEncode(false)).to.throw();
                expect(() => e.validateEncode(1 as any)).to.throw();
                expect(() => e.validateEncode(0 as any)).to.throw();
            });
        });

        describe('False constant', () => {
            const e = new Encoder(Type.Const(false));

            it('Success cases', () => {
                expect(e.decode(e.encode(false))).to.equal(false);
            });

            it('Fail cases', () => {
                expect(() => e.validateEncode(true)).to.throw();
                expect(() => e.validateEncode(1 as any)).to.throw();
                expect(() => e.validateEncode(0 as any)).to.throw();
            });
        });
    });

    describe('Null constant', () => {
        const e = new Encoder(Type.Const(null));

        it('Success cases', () => {
            expect(e.decode(e.encode(null))).to.equal(null);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode(undefined as any)).to.throw();
            expect(() => e.validateEncode(0 as any)).to.throw();
            expect(() => e.validateEncode('' as any)).to.throw();
            expect(() => e.validateEncode(false as any)).to.throw();
        });
    });

    describe('Object constants', () => {
        const constantObject = { id: 1, name: 'test', active: true };
        const e = new Encoder(Type.Const(constantObject));

        it('Success cases', () => {
            expect(e.decode(e.encode(constantObject))).to.deep.equal(constantObject);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode({ id: 2, name: 'test', active: true })).to.throw();
            expect(() => e.validateEncode({ id: 1, name: 'different', active: true })).to.throw();
            expect(() => e.validateEncode({ id: 1, name: 'test', active: false })).to.throw();
            expect(() => e.validateEncode({} as any)).to.throw();
        });
    });

    describe('Array constants', () => {
        const constantArray = [1, 2, 3, 'test', true];
        const e = new Encoder(Type.Const(constantArray));

        it('Success cases', () => {
            expect(e.decode(e.encode(constantArray))).to.deep.equal(constantArray);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode([1, 2, 3, 'test', false])).to.throw();
            expect(() => e.validateEncode([1, 2, 3, 'different', true])).to.throw();
            expect(() => e.validateEncode([1, 2, 4, 'test', true])).to.throw();
            expect(() => e.validateEncode([])).to.throw();
        });
    });

    describe('Nested object constants', () => {
        const constantNested = {
            user: {
                id: 1,
                name: 'John',
                settings: {
                    theme: 'dark',
                    notifications: true
                }
            },
            metadata: {
                created: '2023-01-01',
                updated: '2023-12-31'
            }
        };
        const e = new Encoder(Type.Const(constantNested));

        it('Success cases', () => {
            expect(e.decode(e.encode(constantNested))).to.deep.equal(constantNested);
        });

        it('Fail cases', () => {
            const modified = { ...constantNested };
            modified.user.name = 'Jane';
            expect(() => e.validateEncode(modified)).to.throw();

            const modified2 = { ...constantNested };
            modified2.user.settings.theme = 'light';
            expect(() => e.validateEncode(modified2)).to.throw();
        });
    });

    describe('Special value constants', () => {
        describe('Infinity constant', () => {
            const e = new Encoder(Type.Const(Infinity));

            it('Success cases', () => {
                expect(e.decode(e.encode(Infinity))).to.equal(Infinity);
            });

            it('Fail cases', () => {
                expect(() => e.validateEncode(-Infinity)).to.throw();
                expect(() => e.validateEncode(Number.MAX_VALUE)).to.throw();
            });
        });

        describe('NaN constant', () => {
            const e = new Encoder(Type.Const(NaN));

            it('Success cases', () => {
                const encoded = e.encode(NaN);
                const decoded = e.decode(encoded);
                expect(Number.isNaN(decoded)).to.equal(true);
            });

            it('Fail cases', () => {
                expect(() => e.validateEncode(0)).to.throw();
                expect(() => e.validateEncode(Infinity)).to.throw();
            });
        });

        describe('Zero constant', () => {
            const e = new Encoder(Type.Const(0));

            it('Success cases', () => {
                expect(e.decode(e.encode(0))).to.equal(0);
            });

            it('Fail cases', () => {
                expect(() => e.validateEncode(-0.0001)).to.throw();
                expect(() => e.validateEncode(1)).to.throw();
                expect(() => e.validateEncode(0.0001)).to.throw();
            });
        });
    });

    describe('Buffer constants', () => {
        const constantBuffer = Buffer.from([1, 2, 3, 4, 5]);
        const e = new Encoder(Type.Const(constantBuffer));

        it('Success cases', () => {
            expect(e.decode(e.encode(constantBuffer))).to.deep.equal(constantBuffer);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode(Buffer.from([1, 2, 3, 4, 6]))).to.throw();
            expect(() => e.validateEncode(Buffer.from([1, 2, 3, 4]))).to.throw();
            expect(() => e.validateEncode(Buffer.from([]))).to.throw();
        });
    });

    describe('Empty object constant', () => {
        const e = new Encoder(Type.Const({}));

        it('Success cases', () => {
            expect(e.decode(e.encode({}))).to.deep.equal({});
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode({ key: 'value' } as any)).to.throw();
            expect(() => e.validateEncode(null as any)).to.throw();
        });
    });

    describe('Empty array constant', () => {
        const e = new Encoder(Type.Const([]));

        it('Success cases', () => {
            expect(e.decode(e.encode([]))).to.deep.equal([]);
        });

        it('Fail cases', () => {
            expect(() => e.validateEncode([1] as any)).to.throw();
            expect(() => e.validateEncode(null as any)).to.throw();
        });
    });
});
