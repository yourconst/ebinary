import { SchemaStandardNumber } from '../../types/types';
import { BinaryBuffer } from '../BinaryBuffer';
import { TypeEncoder } from '../TypeEncoder.interface';

type TypeInfo = {
    write: keyof BinaryBuffer;
    read: keyof BinaryBuffer;
    size: number;
    min?: number;
    max?: number;
    nmin?: bigint;
    nmax?: bigint;
    isInt?: boolean;
    isBigInt?: boolean;
    isFloat?: boolean;
};

const map: {
    [key in SchemaStandardNumber]: TypeInfo;
} = {
    'uint8': { write: 'writeUInt8', read: 'readUInt8', size: 1, min: 0, max: (2**8)-1, isInt: true },
    'int8': { write: 'writeInt8', read: 'readInt8', size: 1, min: -(2**7), max: (2**7)-1, isInt: true },
    'uint16_le': { write: 'writeUInt16LE', read: 'readUInt16LE', size: 2, min: 0, max: (2**16)-1, isInt: true },
    'uint16_be': { write: 'writeUInt16BE', read: 'readUInt16BE', size: 2, min: 0, max: (2**16)-1, isInt: true },
    'int16_le': { write: 'writeInt16LE', read: 'readInt16LE', size: 2, min: -(2**15), max: (2**15)-1, isInt: true },
    'int16_be': { write: 'writeInt16BE', read: 'readInt16BE', size: 2, min: -(2**15), max: (2**15)-1, isInt: true },
    'uint32_le': { write: 'writeUInt32LE', read: 'readUInt32LE', size: 4, min: 0, max: (2**32)-1, isInt: true },
    'uint32_be': { write: 'writeUInt32BE', read: 'readUInt32BE', size: 4, min: 0, max: (2**32)-1, isInt: true },
    'int32_le': { write: 'writeInt32LE', read: 'readInt32LE', size: 4, min: -(2**31), max: (2**31)-1, isInt: true },
    'int32_be': { write: 'writeInt32BE', read: 'readInt32BE', size: 4, min: -(2**31), max: (2**31)-1, isInt: true },
    'uint64_le': { write: 'writeBigUInt64LE', read: 'readBigUInt64LE', size: 8, nmin: 0n, nmax: 2n**64n-1n, isBigInt: true },
    'uint64_be': { write: 'writeBigUInt64BE', read: 'readBigUInt64BE', size: 8, nmin: 0n, nmax: 2n**64n-1n, isBigInt: true },
    'int64_le': { write: 'writeBigInt64LE', read: 'readBigInt64LE', size: 8, nmin: -(2n**63n), nmax: 2n**63n-1n, isBigInt: true },
    'int64_be': { write: 'writeBigInt64BE', read: 'readBigInt64BE', size: 8, nmin: -(2n**63n), nmax: 2n**63n-1n, isBigInt: true },
    'float32_le': { write: 'writeFloatLE', read: 'readFloatLE', size: 4, isFloat: true },
    'float32_be': { write: 'writeFloatBE', read: 'readFloatBE', size: 4, isFloat: true },
    'float64_le': { write: 'writeDoubleLE', read: 'readDoubleLE', size: 8, isFloat: true },
    'float64_be': { write: 'writeDoubleBE', read: 'readDoubleBE', size: 8, isFloat: true },
};

export class _te_number implements TypeEncoder<number | bigint> {
    readonly isSizeFixed = true;
    readonly getSize: TypeEncoder<number | bigint>['getSize'];
    readonly validateGetSize: TypeEncoder<number | bigint>['validateGetSize'];
    readonly encode: TypeEncoder<number | bigint>['encode'];
    readonly decode: TypeEncoder<number | bigint>['decode'];

    constructor(readonly schema: SchemaStandardNumber) {
        const info = map[schema];

        if (!info) {
            throw new Error('Bad number type', { cause: schema });
        }

        const { write, read, size, min, max, nmin, nmax, isInt, isBigInt, isFloat } = info;
        
        if (isInt) {
            this.validateGetSize = (value: number) => {
                if (typeof value !== 'number' || value < min || value > max || Math.trunc(value) !== value) {
                    throw new Error(`Is not ${schema}`, { cause: value });
                }

                return size;
            };
        } else if (isBigInt) {
            this.validateGetSize = (value: bigint) => {
                if (typeof value !== 'bigint' || value < nmin || value > nmax) {
                    throw new Error(`Is not bigint`, { cause: value });
                }

                return size;
            };
        } else {
            this.validateGetSize = (value: number) => {
                if (typeof value !== 'number') {
                    throw new Error(`Is not ${schema}`, { cause: value });
                }

                return size;
            };
        }

        try {
            this.getSize = <any>Function('', `return ${size}`);
            this.encode = <any>Function('bp, value', `bp.buffer.${<string>write}(value, bp.getAdd(${size}))`);
            this.decode = <any>Function('bp', `return bp.buffer.${<string>read}(bp.getAdd(${size}))`);
        } catch (error) {
            this.getSize = () => size;
            this.encode = (bp, value: number) => bp.buffer[<'writeUInt8'> write](value, bp.getAdd(size));
            this.decode = (bp) => bp.buffer[<'readUInt8'> read](bp.getAdd(size));
        }

        // TODO: test with Function constructor
    }

    getSchema() {
        return this.schema;
    }
}
