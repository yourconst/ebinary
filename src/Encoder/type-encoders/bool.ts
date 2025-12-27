import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';

export class _te_bool implements TypeEncoder<boolean> {
    readonly isSizeFixed = true;

    constructor(readonly schema: Types.Bool) {}

    getSize() {
        return 1;
    }

    validateGetSize(value: boolean) {
        if (typeof value !== 'boolean') {
            throw new Error(`Is not boolean`, { cause: value });
        }

        return 1;
    }

    encode(bp: BufferPointer, value: boolean) {
        bp.writeByte(<any>!!value);
    }

    decode(bp: BufferPointer) {
        return !!bp.readByte();
    }

    getSchema(): Types.Schema {
        return 'bool';
    }
}
