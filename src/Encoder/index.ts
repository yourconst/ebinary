import { Schema, SchemaResultType } from '../types';
import { _StringEncoding } from '../types/types';
import { argd } from './argd';
import { BinaryBuffer, CustomBinaryBuffer } from './BinaryBuffer';
import { BufferPointer } from './BufferPointer';
import { parseSchema } from './type-encoders';
import { LCRoot } from './type-encoders/low_cardinality';
import { _stringLengthCache } from './type-encoders/string';
import { _transformCache } from './type-encoders/transform';
import { TypeEncoder } from './TypeEncoder.interface';

const EncodeBuffer = CustomBinaryBuffer;
const DecodeBuffer = BinaryBuffer;

// console.log({
//     EncodeBuffer,
//     DecodeBuffer,
// });

export class Encoder<S extends Schema/* , BBC extends typeof BinaryBuffer = typeof BinaryBuffer */> {
    private readonly _lcRoot: LCRoot;
    private readonly _type: TypeEncoder;

    constructor(private schema: S/* , readonly BBC: BBC = <any> BinaryBuffer */) {
        this._lcRoot = LCRoot.createAndSetActive();
        this._type = parseSchema(this.schema);

        this._lcRoot.afterInit();
    }

    encode = (value: SchemaResultType<S>) => {
        _stringLengthCache.clear();
        _transformCache.clear();
        const size = this._type.getSize(value);
        const tcp = _transformCache.getPosition();
        const slcp = _stringLengthCache.getPosition();
        const buffer = EncodeBuffer.allocUnsafe(size + this._lcRoot.getSize());

        const bp = new BufferPointer(buffer);

        _transformCache.setPosition(tcp);
        _stringLengthCache.setPosition(slcp);
        this._lcRoot.encode(bp);
        _transformCache.setPosition(0);
        _stringLengthCache.setPosition(0);
        this._type.encode(bp, value);

        _transformCache.clear();
        _stringLengthCache.clear();
        this._lcRoot.clear();

        return buffer;
    }

    validateEncode = (value: SchemaResultType<S>) => {
        _stringLengthCache.clear();
        _transformCache.clear();
        const size = this._type.validateGetSize(value);
        const tcp = _transformCache.getPosition();
        const slcp = _stringLengthCache.getPosition();
        const buffer = EncodeBuffer.allocUnsafe(size + this._lcRoot.getSize());

        const bp = new BufferPointer(buffer);

        _transformCache.setPosition(tcp);
        _stringLengthCache.setPosition(slcp);
        this._lcRoot.encode(bp);
        _transformCache.setPosition(0);
        _stringLengthCache.setPosition(0);
        this._type.encode(bp, value);

        _transformCache.clear();
        _stringLengthCache.clear();
        this._lcRoot.clear();

        return buffer;
    }

    decode: {
        (src: Buffer | BinaryBuffer): SchemaResultType<S>;
        (src: ArrayBuffer, byteOffset?: number, byteLength?: number): SchemaResultType<S>;
        // (src: string, encoding?: _StringEncoding): SchemaResultType<S>
    } = (src: any, ...params: any[]): SchemaResultType<S> => {
        const buffer = src instanceof DecodeBuffer
            ? src
            : src instanceof ArrayBuffer
            ? DecodeBuffer.from(src, ...params)
            : DecodeBuffer.from(src.buffer, src.byteOffset, src.byteLength);

        const bp = new BufferPointer(buffer);

        this._lcRoot.decode(bp);
        return this._type.decode(bp);
    }

    getSchema() {
        return this.schema;
    }
}
