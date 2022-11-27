import { TypePacker } from '../TypePacker.interface';
import * as Types from '../../schemas/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { BinaryBuffer } from '../BinaryBuffer';

export class _tp_transform implements TypePacker {
    readonly isSizeFixed: boolean;
    readonly _child: TypePacker;
    readonly _encode: (decoded: any) => any;
    readonly _decode: (encoded: any) => any;

    constructor(readonly schema: Types.Transform) {
        this._child = parseSchema(schema.child);

        this.isSizeFixed = this._child.isSizeFixed;

        this._encode = schema.encode;
        this._decode = schema.decode;
    }

    getSize(value: any) {
        return this._child.getSize(this._encode(value));
    }

    encode(bp: BufferPointer, value: any) {
        this._child.encode(bp, this._encode(value));
    }

    decode(bp: BufferPointer) {
        return this._decode(this._child.decode(bp));
    }

    getSchema(): Types.Schema {
        return this._child.getSchema();
    }
}
