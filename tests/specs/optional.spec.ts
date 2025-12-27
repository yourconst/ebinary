import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Optional', () => {
    it('With bool', () => {
        const e = new Encoder(Type.Optional(Type.Bool()));

        expect(e.encode(false)).to.deep.equal(Buffer.from([0,0]));
        expect(e.encode(true)).to.deep.equal(Buffer.from([0,1]));
        expect(e.encode(null)).to.deep.equal(Buffer.from([1]));
        expect(e.encode(undefined as any)).to.deep.equal(Buffer.from([1]));

        expect(e.decode(e.encode(false))).to.deep.equal(false);
        expect(e.decode(e.encode(true))).to.deep.equal(true);
        expect(e.decode(e.encode(null))).to.deep.equal(null);
        expect(e.decode(e.encode(undefined as any))).to.deep.equal(null);
    });
});
