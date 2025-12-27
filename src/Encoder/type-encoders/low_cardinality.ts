import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { BufferPointer } from '../BufferPointer';
import { parseLengthSchema, parseSchema } from '.';
import { _te_array } from './array';

export class LCRoot {
    private static _active?: LCRoot;

    static getActive() {
        return this._active;
    }

    static setActive(root: LCRoot) {
        return this._active = root;
    }

    static createAndSetActive() {
        return this.setActive(new LCRoot());
    }


    private readonly groups = new Map<string | number, _te_low_cardinality>();
    private readonly lcList: _te_low_cardinality[] = [];
    
    getLC(schema: Types.LowCardinality) {
        if (schema.group !== undefined) {
            let lc = this.groups.get(schema.group);
            
            if (lc) {
                // TODO: check
            } else {
                lc = new _te_low_cardinality(schema);
                this.groups.set(schema.group, lc);
            }

            return lc;
        }

        const lc = new _te_low_cardinality(schema);
        this.lcList.push(lc);
        return lc;
    }

    afterInit() {
        this.lcList.push(...this.groups.values());

        this.groups.clear();

        if (this.lcList.length === 0) {
            this.getSize = () => 0;
            this.encode = () => {};
            this.decode = () => {};

            return;
        }

        if (this.lcList.length === 1) {
            const lc = this.lcList[0];

            // console.log('Single mode enabled');

            this.getSize = () => lc._getFinalSize();
            this.encode = (bp) => lc._encodeList(bp);
            this.decode = (bp) => lc._decodeList(bp);
            this.clear = () => lc._clear();

            return;
        }
    }

    private _finalCount = 0;

    getSize() {
        let result = 1;

        for (const lc of this.lcList) {
            if (lc._hasEntries()) {
                ++this._finalCount;
                result += 1 + lc._getFinalSize();
            }
        }

        return result;
    }

    encode(bp: BufferPointer) {
        bp.writeByte(this._finalCount);

        for (let i=0; i<this.lcList.length; ++i) {
            if (this.lcList[i]._hasEntries()) {
                bp.writeByte(i);
                this.lcList[i]._encodeList(bp);
            }
        }
    }

    decode(bp: BufferPointer) {
        const count = bp.readByte();

        for (let i=0; i<count; ++i) {
            this.lcList[bp.readByte()]._decodeList(bp);
        }
    }

    clear() {
        this._finalCount = 0;

        for (const lc of this.lcList) {
            lc._clear();
        }
    }
}

class _te_low_cardinality implements TypeEncoder<any> {
    private readonly entries = new Map<string | number, { index: number, refSize: number }>();
    private earray: any[] = [];

    // need for traversal
    readonly isSizeFixed = false;
    readonly _child: TypeEncoder;
    readonly _childArray: _te_array;
    readonly _refType: TypeEncoder<number>;
    readonly _group?: string | number;
    readonly _getKey?: (v: any) => string | number;

    constructor(readonly schema: Types.LowCardinality) {
        this._refType = (schema.refType === 'uint64_le' || schema.refType === 'uint64_be') ?
            parseSchema(schema.refType) :
            parseLengthSchema(schema.refType ?? 'uvarint32');
        this._group = schema.group;
        this._getKey = schema.getKey ?? (v => v);
        this._child = parseSchema(schema.child);
        this._childArray = new _te_array({
            type: 'array',
            lengthType: 'uvarint32',
            child: schema.child,
        });
    }

    _clear() {
        this.entries.clear();
        this.earray.length = 0;
    }

    _hasEntries() {
        return !!this.entries.size;
    }

    getSize(value: any) {
        const key = this._getKey(value);
        let entryInfo = this.entries.get(key);

        if (!entryInfo) {
            const index = this.earray.length;
            entryInfo = {
                index,
                refSize: this._refType.getSize(index),
            };
            // this._finalSize += this._child.getSize(value);
            this.entries.set(key, entryInfo);
            this.earray.push(value);
        }

        return entryInfo.refSize;
    }

    validateGetSize(value: any) {
        const key = this._getKey(value);
        let entryInfo = this.entries.get(key);

        if (!entryInfo) {
            const index = this.earray.length;
            entryInfo = {
                index,
                refSize: this._refType.validateGetSize(index),
            };
            // this._finalSize += this._child.validateGetSize(value);
            this.entries.set(key, entryInfo);
            this.earray.push(value);
        }

        return entryInfo.refSize;
    }

    _getFinalSize() {
        return this._childArray.getSize(this.earray);
    }

    _encodeList(bp: BufferPointer) {
        this._childArray.encode(bp, this.earray);
    }

    encode(bp: BufferPointer, value: any) {
        this._refType.encode(bp, this.entries.get(this._getKey(value)).index);
    }

    _decodeList(bp: BufferPointer) {
        // TODO: check neccerity
        this._childArray.decodeInto(bp, this.earray);
        return this.earray;
    }

    decode(bp: BufferPointer) {
        // console.log(this.earray);
        return this.earray[this._refType.decode(bp)];
    }

    getSchema(): Types.LowCardinality {
        return {
            type: 'low_cardinality',
            child: this._child.getSchema(),
            refType: <any> this._refType.getSchema(),
            group: this._group,
            getKey: this._getKey,
        };
    }
}
