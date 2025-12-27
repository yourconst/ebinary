import { Encoder, Type } from '../../src';
import { Random } from '../utils/helpers/common';
import { expect } from 'chai';

describe('Buffer', () => {
    const e = new Encoder(Type.Buffer());

    function expectEquals(numbers: number[]) {
        expect(e.decode(e.encode(Buffer.from(numbers)))).to.deep.equal(Buffer.from(numbers));
    }

    it('Success case', () => {
        expectEquals([]);
        expectEquals([0]);
        expectEquals([1]);
        expectEquals([-1]);
        expectEquals([-1, -2, -3, -127, -128, -255, -256, 0, 1, 2, 3, 127, 128, 255, 256]);
        expectEquals(new Array(1e5).fill(1).map(() => Random.int(256)));
    });
});
