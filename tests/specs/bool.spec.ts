import { Encoder, Type } from '../../src';
import { expect } from 'chai';

describe('Bool', () => {
    const e = new Encoder(Type.Bool());

    it('Success cases', () => {
        // Test true
        expect(e.decode(e.encode(true))).to.equal(true);
        expect(e.decode(e.validateEncode(true))).to.equal(true);
        
        // Test false
        expect(e.decode(e.encode(false))).to.equal(false);
        expect(e.decode(e.validateEncode(false))).to.equal(false);
    });

    it('Edge cases', () => {
        // Test with truthy/falsy values
        expect(e.decode(e.encode(1 as any))).to.equal(true);
        expect(e.decode(e.encode(0 as any))).to.equal(false);
        expect(e.decode(e.encode('' as any))).to.equal(false);
        expect(e.decode(e.encode('test' as any))).to.equal(true);
    });

    it('Encoding consistency', () => {
        // Ensure consistent encoding
        const trueEncoded = e.encode(true);
        const falseEncoded = e.encode(false);
        
        expect(trueEncoded).to.have.length(1);
        expect(falseEncoded).to.have.length(1);
        expect(trueEncoded[0]).to.equal(1);
        expect(falseEncoded[0]).to.equal(0);
    });
});
