import type { Buffer as NativeBuffer } from 'buffer';

export type UInt8 = 'uint8';
export type Int8 = 'int8';
export type UInt16 = 'uint16_le' | 'uint16_be';
export type Int16 = 'int16_le' | 'int16_be';
export type UInt32 = 'uint32_le' | 'uint32_be';
export type Int32 = 'int32_le' | 'int32_be';
export type UInt64 = 'uint64_le' | 'uint64_be';
export type Int64 = 'int64_le' | 'int64_be';

export type Float32 = 'float32_le' | 'float32_be';
export type Float64 = 'float64_le' | 'float64_be';

export type UVarInt32 = 'uvarint32';
export type VarInt32 = 'varint32';
// TODO: add VLQ


export type Bool = 'bool';

export type Const<T = any> = {
    type: 'const';
    value: T;
};


export type _Length = UInt8 | UInt16 | UInt32 | UVarInt32 | Const<number>;
export type _StringEncoding = 'utf8' | 'ascii' | 'ucs2';

export type String = {
    type: 'string';
    encoding?: _StringEncoding;
    lengthType?: _Length;
};

export type Buffer = {
    type: 'buffer';
    lengthType?: _Length;
};

export type Array = {
    type: 'array';
    child: Schema;
    lengthType?: _Length;
};

export type Struct = {
    type: 'struct';
    fields?: {
        [key: string]: Schema;
    };
    orderedFields?: {
        name: string;
        type: Schema;
    }[];
};

export type OneOf = {
    type: 'one_of';
    fields?: {
        [key: string]: Schema;
    };
    orderedFields?: {
        name: string;
        type: Schema;
    }[];
};

export type Enum = {
    type: 'enum',
    values: any[];
    bigIndexType?: UVarInt32 | UInt16;
};

export type Optional = {
    type: 'optional';
    child: Schema;
    defaultValue?: any;
};

export type LowCardinality = {
    type: 'low_cardinality';
    child: Schema/*  & (String | Exclude<SchemaNumber, UInt8 | Int8>) */;
    refType?: _Length | UInt64;
    group?: string | number;
    getKey?: (v: any) => string | number;
};

export type __Align = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const __Align = new Set<__Align>([1, 2, 3, 4, 5, 6, 7, 8]);

export type Aligned = {
    type: 'aligned';
    align: __Align;
    child: Schema;
};

export type Transform = {
    type: 'transform';
    child: Schema;
    cache?: boolean;
    encode: (decoded: any) => any;
    decode: (encoded: any) => any;
};


export type SchemaInt = UInt8 | Int8 | UInt16 | Int16 | UInt32 | Int32;
export type SchemaBigInt = UInt64 | Int64;
export type SchemaFloat = Float32 | Float64;
export type SchemaStandardNumber = SchemaInt | SchemaBigInt | SchemaFloat;

export type SchemaVarInt = UVarInt32 | VarInt32;
export type SchemaNumber = SchemaStandardNumber | SchemaVarInt;

export type SchemaSimple = SchemaNumber | Bool;
export type SchemaComplex = Const | Aligned | String | LowCardinality | Buffer | Array | Struct | OneOf | Enum | Optional | Transform;

export type Schema = SchemaSimple | SchemaComplex;

// type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N; 
// type IsNotAny<T> = IfAny<T, never, true>;


// type _Depth = 10 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0;
// type _Dec<D extends _Depth> =
//     D extends 10 ? 9 : D extends 9 ? 8 : D extends 8 ? 7 : D extends 7 ? 6 : D extends 6 ? 5 :
//     D extends 5 ? 4 : D extends 4 ? 3 : D extends 3 ? 2 : D extends 2 ? 1 : D extends 1 ? 0 : 0;

// export type SchemaResultType<S extends Schema> = _SchemaResultType<S, 10>;

// type _SchemaResultType<S extends Schema, D extends _Depth> =
//     // IsNotAny<S> extends never ? unknown :
//     0 extends (1 & S) ? unknown :
//     S extends Const ? S['value'] :
//     S extends SchemaBigInt ? bigint :
//     S extends SchemaNumber ? number :
//     S extends String ? string :
//     S extends Buffer ? (Uint8Array | NativeBuffer) :
//     S extends Bool ? boolean :
//     D extends 0 ? unknown :
//     S extends LowCardinality ? _SchemaResultType<S['child'], _Dec<D>> :
//     S extends Aligned ? _SchemaResultType<S['child'], _Dec<D>> :
//     // S extends OneOf ? SchemaResultType<S['childs'][number]> :
//     S extends Transform ? ReturnType<S['decode']> :
//     S extends Optional ? null | _SchemaResultType<S['child'], _Dec<D>> :
//     S extends Array ? _SchemaResultType<S['child'], _Dec<D>>[] :
//     S extends Struct ? (
//         S extends { fields: Record<string, Schema> } ?
//             { [key in keyof S['fields']]: _SchemaResultType<S['fields'][key], _Dec<D>> } :
//             Record<string, unknown>
//     ) :
//     S extends OneOf ? {
//         [key in keyof S['fields']]?: _SchemaResultType<S['fields'][key], _Dec<D>>
//     } :
//     S extends Enum ? S['values'][number] :
//     unknown;


export type SchemaResultType<S extends Schema> =
    // IsNotAny<S> extends never ? unknown :
    0 extends (1 & S) ? unknown :
    S extends Const ? S['value'] :
    S extends SchemaBigInt ? bigint :
    S extends SchemaNumber ? number :
    S extends String ? string :
    S extends Buffer ? Uint8Array :
    S extends Bool ? boolean :
    S extends LowCardinality ? SchemaResultType<S['child']> :
    S extends Aligned ? SchemaResultType<S['child']> :
    // S extends OneOf ? SchemaResultType<S['childs'][number]> :
    S extends Transform ? Parameters<S['encode']>[0] :
    S extends Optional ? null | undefined | SchemaResultType<S['child']> :
    S extends Array ? SchemaResultType<S['child']>[] :
    S extends Struct ?
        S['orderedFields'] extends [] ? {
            [key in S['orderedFields'][number]['name']]:
                SchemaResultType<Extract<{ name: key; }, S['orderedFields'][number]>['type']>;
        } : {
            [key in keyof S['fields']]: SchemaResultType<S['fields'][key]>
        } :
    S extends OneOf ? {
        [key in keyof S['fields']]?: SchemaResultType<S['fields'][key]>
    } :
    S extends Enum ? S['values'][number] :
    unknown;
