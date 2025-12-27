import { Encoder, Type } from '../../../src';
import { SchemaBigInt } from '../../../src/types/types';
import { expect } from 'chai';

const BIMath = {
    min(...nums: [bigint, bigint, ...bigint[]]) {
        let res = nums[0];

        for (const num of nums) {
            if (num < res) {
                res = num;
            }
        }

        return res;
    },
    max(...nums: [bigint, bigint, ...bigint[]]) {
        let res = nums[0];

        for (const num of nums) {
            if (num > res) {
                res = num;
            }
        }

        return res;
    },
};

function generateSeries(min: bigint, max: bigint) {
    const result: bigint[] = [];

    for (let i = min; i <= max; ++i) {
        result.push(i);
    }

    return result;
}

function generateSuccessValues(min: bigint, max: bigint) {
    const result: bigint[] = [];

    result.push(...generateSeries(min, BIMath.min(max, min + BigInt(128))));
    const middle = (max + min) / BigInt(2);
    result.push(...generateSeries(
        BIMath.max(min, middle - BigInt(128)),
        BIMath.min(max, middle + BigInt(128)),
    ));
    result.push(...generateSeries(BIMath.max(min, max - BigInt(128)), max));

    return result;
}

function generateFailValues(min: bigint, max: bigint) {
    const result: bigint[] = [];

    result.push(...generateSeries(min*BigInt(2)-BigInt(128), min*BigInt(2)-BigInt(1)));
    result.push(...generateSeries(min-BigInt(128), min-BigInt(1)));
    result.push(...generateSeries(max+BigInt(1), max+BigInt(128)));
    result.push(...generateSeries(max*BigInt(2)+BigInt(1), max*BigInt(2)+BigInt(128)));

    return result;
}

function main<S extends SchemaBigInt>(encoder: Encoder<S>, min: bigint, max: bigint) {
    const e = encoder as unknown as Encoder<'int64_be'>;

    it('Success cases', () => {
        for (const v of generateSuccessValues(min, max)) {
            expect(e.decode(e.validateEncode(v))).to.deep.equal(v);
            expect(e.decode(e.encode(v))).to.deep.equal(v);
        }
    });

    it('Fail cases', () => {
        for (const v of generateFailValues(min, max)) {
            expect(() => e.validateEncode(v)).to.throw();
            // expect(() => e.encode(v)).to.throw();
        }
    });
}

describe('Int64 LE', () => {
    main(new Encoder(Type.Int64('le')), -(BigInt(2)**BigInt(63)), (BigInt(2)**BigInt(63)) - BigInt(1));
});

describe('Int64 BE', () => {
    main(new Encoder(Type.Int64('be')), -(BigInt(2)**BigInt(63)), (BigInt(2)**BigInt(63)) - BigInt(1));
});

describe('UInt64 LE', () => {
    main(new Encoder(Type.UInt64('le')), BigInt(0), (BigInt(2)**BigInt(64)) - BigInt(1));
});

describe('UInt64 BE', () => {
    main(new Encoder(Type.UInt64('be')), BigInt(0), (BigInt(2)**BigInt(64)) - BigInt(1));
});
