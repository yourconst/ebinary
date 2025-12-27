import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';

const temp = new Uint32Array(1);

const maxUInt32 = (2 ** 32) - 1;

// const getSize = (value: number) => Math.ceil((Math.log2(value < 2 ? 2 : value + 1) / 7));
const getSize = (value: number) =>
    value < 128 ? 1 :
    value < 16384 ? 2 :
    value < 2097152 ? 3 :
    value < 268435456 ? 4 :
    5;

export class _te_uvarint32 implements TypeEncoder<number> {
    readonly isSizeFixed = false;

    constructor(readonly schema: Types.UVarInt32) {}

    getSize(value: number) {
        return getSize(value);
    }

    validateGetSize(value: number) {
        if (!isFinite(value) || value < 0 || maxUInt32 < value || Math.trunc(value) !== value) {
            throw new Error(`Is not uint32`, { cause: value });
        }

        return getSize(value);
    }

    encode(bp: BufferPointer, value: number) {
        while (value > 127) {
            bp.writeByte(value & 127 | 128);
            value >>>= 7;
        }
        bp.writeByte(value);

        // while (true) {
        //     let byte = value & 127;

        //     if (value <= byte) {
        //         bp.writeByte(byte);
        //         break;
        //     }

        //     bp.writeByte(byte | 128);
        //     // bp.buffer.writeUInt8(byte | 128, bp.getAdd(1));

        //     value >>= 7;
        // }
    }

    // decode(bp: BufferPointer) {
    //     let result = 0;
    //     let shift = 0;

    //     while (true) {
    //         const byte = bp.readByte();
    //         result |= (byte & 127) << shift;
    //         if ((byte & 128) == 0)
    //             break;
    //         shift += 7;
    //     }

    //     return result;
    // }

    decode(bp: BufferPointer) {
        temp[0] = 0;
        let shift = 0;

        while (true) {
            const byte = bp.readByte();
            temp[0] |= (byte & 127) << shift;
            if ((byte & 128) == 0)
                break;
            shift += 7;
        }

        return temp[0];
    }

    getSchema(): Types.Schema {
        return 'uvarint32';
    }
}
