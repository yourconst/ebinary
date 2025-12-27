import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { Cache } from './_Cache';

export const _transformCache = new Cache();

export class _te_transform implements TypeEncoder {
    readonly isSizeFixed: boolean;
    readonly _child: TypeEncoder;
    readonly _cache: boolean;
    readonly _encode: (decoded: any) => any;
    readonly _decode: (encoded: any) => any;

    constructor(readonly schema: Types.Transform) {
        this._child = parseSchema(schema.child);

        this.isSizeFixed = this._child.isSizeFixed;

        this._cache = !!schema.cache;
        this._encode = schema.encode;
        this._decode = schema.decode;

        if (!this._cache) {
            this.getSize = (value: any) => this._child.getSize(this._encode(value));
            this.validateGetSize = (value: any) => this._child.validateGetSize(this._encode(value));
            this.encode = (bp, value) => this._child.encode(bp, this._encode(value));
        }
    }

    getSize(value: any) {
        const eValue = this._encode(value);
        _transformCache.add(eValue);
        return this._child.getSize(eValue);
    }

    validateGetSize(value: any) {
        const eValue = this._encode(value);
        _transformCache.add(eValue);
        return this._child.validateGetSize(eValue);
    }

    encode(bp: BufferPointer, value: any) {
        this._child.encode(bp, _transformCache.get());
    }

    decode(bp: BufferPointer) {
        return this._decode(this._child.decode(bp));
    }

    getSchema(): Types.Schema {
        return this._child.getSchema();
    }
}
