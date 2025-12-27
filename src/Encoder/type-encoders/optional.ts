import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';

const isNull = (value: any) => value === null || value === undefined;

export class _te_optional implements TypeEncoder {
    readonly isSizeFixed = false;
    readonly _child: TypeEncoder;
    readonly defaultValue?: any;

    constructor(readonly schema: Types.Optional) {
        this._child = parseSchema(schema.child);
        this.defaultValue = schema.defaultValue ?? null;
    }

    getSize(value: any) {
        return 1 + (((!isNull(value)) || 0) && this._child.getSize(value));
    }

    validateGetSize(value: any) {
        return 1 + (((!isNull(value)) || 0) && this._child.validateGetSize(value));
    }

    encode(bp: BufferPointer, value: any) {
        if (isNull(value)) {
            bp.writeByte(1);
        } else {
            bp.writeByte(0);
            this._child.encode(bp, value);
        }
    }

    decode(bp: BufferPointer) {
        if (bp.readByte()) {
            return this.defaultValue;
        }
        return this._child.decode(bp);
    }

    getSchema(): Types.Schema {
        return {
            type: 'optional',
            child: this._child.getSchema(),
        };
    }
}
