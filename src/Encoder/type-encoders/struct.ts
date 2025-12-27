import { TypeEncoder } from '../TypeEncoder.interface';
import * as Types from '../../types/types';
import { parseLengthSchema, parseSchema } from '.';
import { BufferPointer } from '../BufferPointer';

const isNull = (v: any) => v === undefined || v === null;

function escape(name: string, delim = "'") {
    return name.replaceAll('\\', '\\\\').replaceAll(`${delim}`, '\\');
}

type Field = {
    name: string;
    nameEscaped: string;
    type: TypeEncoder;
    optional: number;
    defaultValue?: any;
    bool: number;
};

export class _te_struct implements TypeEncoder<Record<string, any>> {
    readonly isSizeFixed: boolean = true;
    private readonly _fields: Field[] = [];
    private readonly _notFixedFields: Field[] = [];
    private readonly _fixedFieldsSize = 0;
    private readonly _optionalFlagsCount = 0;
    private readonly _optionalFlagsSize: number;
    private readonly _optimizeNulls = false;

    constructor(readonly schema: Types.Struct) {
        const fields = schema.orderedFields ?
            schema.orderedFields :
            Object.entries(schema.fields).map(([name, type]) => ({ name, type }));
        
        
        for (const { name, type } of fields) {
            const optional = (this._optimizeNulls && typeof type === 'object') ? type.type === 'optional' ? 1 : 0 : 0;
            const bool = +(this._optimizeNulls && (optional ? (type as Types.Optional).child === 'bool' : type === 'bool'));
            const _type = parseSchema(optional ? (type as Types.Optional).child : type);
            const field: Field = { name, nameEscaped: escape(name), type: _type, optional, bool, ...optional && {
                defaultValue: (type as Types.Optional).defaultValue ?? null,
            } };

            this._fields.push(field);

            if (field.optional) {
                this._optionalFlagsCount += field.optional;
            }

            if (field.bool) {
                this._optionalFlagsCount += 1;
            }

            if (_type.isSizeFixed && !field.optional) {
                this._fixedFieldsSize += _type.getSize(null);
            } else
            if (!field.bool) {
                this.isSizeFixed = false;
                this._notFixedFields.push(field);
            }
        }

        this._optionalFlagsSize = Math.ceil(this._optionalFlagsCount / 8);
        this._fixedFieldsSize += this._optionalFlagsSize;

        const _fs = this._fields;

        if (typeof Function !== 'function') {
            return;
        }

        if (this.isSizeFixed) {
            this.getSize = () => this._fixedFieldsSize;
        } else if (this._fixedFieldsSize) {
            this.getSize = Function('_fixedFieldsSize, _nffs', `
                ${this._notFixedFields.map((_, i) => `var type_${i} = _nffs[${i}].type;`).join('\n')};

                return (value) => {
                    return _fixedFieldsSize + ${this._notFixedFields.map(({ name }, i) => `type_${i}.getSize(value.${escape(name)})`).join('+')};
                };
            `)(this._fixedFieldsSize, this._notFixedFields);
            // this.getSize = (value) =>
            //     this._fixedFieldsSize + this._notFixedFields.reduce(
            //         (acc, { name, type }) => (acc + type.getSize(value[name])),
            //         0,
            //     );
        } else {
            this.getSize = Function('_fs', `
                ${_fs.map((_, i) => `var type_${i} = _fs[${i}].type;`).join('\n')};

                return (value) => {
                    return ${_fs.map(({ nameEscaped }, i) => `type_${i}.getSize(value.${nameEscaped})`).join('+')};
                };
            `)(_fs);
            // this.getSize = (value) =>
            //     this._notFixedFields.reduce(
            //         (acc, { nameEscaped, type }) => (acc + type.getSize(value[nameEscaped])),
            //         0,
            //     );
        }

        this.validateGetSize = Function('_fs', `
                ${_fs.map((_, i) => `var type_${i} = _fs[${i}].type;`).join('\n')};

                return (value, path) => {
                    if (!(value instanceof Object)) {
                        throw new Error(\`Is not object (\${path}, value: \${value})\`, { cause: value });
                    }
                    return ${_fs.map(({ nameEscaped }, i) => `type_${i}.validateGetSize(value.${nameEscaped})`).join('+')};
                };
            `)(_fs);

        this.encode = Function('_fs', `
            ${_fs.map((_, i) => `var type_${i} = _fs[${i}].type;`).join('\n')}
            var isNull = v => v === undefined || v === null;

            return (bp, value) => {
                ${this._optionalFlagsSize ? 'var o = bp.getAdd(this._optionalFlagsSize); var bi = 0;' : ''}

                ${_fs.map((f, i) =>
                    (f.optional
                      ? `var isNull_${i} = isNull(value.${f.nameEscaped});\n` +
                        `bp.writeBit(isNull_${i}, o, bi);\n` +
                        `bi += ${f.optional};\n` +
                        `if (isNull_${i} === false)`
                      : ''
                    ) +
                    (f.bool
                        ? `bp.writeBit(!!value.${f.nameEscaped}, o, bi);`
                        : `type_${i}.encode(bp, value.${f.nameEscaped});`
                    ) +
                    (f.bool ? `bi += ${f.bool};` : '')
                ).join('\n')}
            };
        `)(_fs);

        // according to https://stackoverflow.com/questions/16200387/are-javascript-object-properties-assigned-in-order
        const decodeText = `
            ${_fs.map((_, i) => `var type_${i} = _fs[${i}].type;`).join('\n')}
            ${this._optionalFlagsSize
                ? _fs.map((_, i) => `var defaultValue_${i} = _fs[${i}].defaultValue;`).join('\n')
                : ''
            }

            return (bp) => {
                ${this._optionalFlagsSize ? 'var o = bp.getAdd(this._optionalFlagsSize); var bi = 0;' : ''}
                return {
                ${_fs.map((f, i) => `${f.nameEscaped}: ` +
                    (f.optional
                      ? `bp.readBit(o, bi++) ? defaultValue_${i} : `
                      : ''
                    ) + `type_${i}.decode(bp)`).join(',\n')}
                };
            };
        `;

        // console.log(decodeText);
    
        this.decode = Function('_fs', decodeText)(_fs);
    }

    getSize(value: Record<string, any>) {
        return this._fixedFieldsSize + this._notFixedFields.reduce(
            (acc, { name, type, optional, bool }) => (acc + (optional && isNull(value[name]) ? 0 : bool ? 0 : type.getSize(value[name]))),
            0,
        );
    }

    validateGetSize(value: Record<string, any>) {
        if (!(value instanceof Object)) {
            throw new Error(`Is not object`, { cause: value });
        }
        return this._fixedFieldsSize + this._fields.reduce(
            (acc, { name, type, optional, bool }) => (
                acc + (optional && isNull(value[name])
                    ? 0
                    : bool
                    ? type.validateGetSize(value[name]) && 0
                    : type.validateGetSize(value[name])
                )
            ),
            0,
        );
    }

    encode(bp: BufferPointer, value: Record<string, any>) {
        const o = bp.getAdd(this._optionalFlagsSize);

        for (let i=0, bi=0; i<this._fields.length; ++i) {
            const f = this._fields[i];
            const v = value[f.name];

            const n = f.optional && isNull(v);

            if (f.optional) {
                bp.writeBit(n, o, bi);
                bi += f.optional;
            }
            
            if (f.bool) {
                bp.writeBit(!!v, o, bi++);
            } else
            if (!n) {
                f.type.encode(bp, v);
            }
        }
    }

    decode(bp: BufferPointer) {
        const o = bp.getAdd(this._optionalFlagsSize);
        const result = {};

        for (let i=0, bi=0; i<this._fields.length; ++i) {
            const f = this._fields[i];

            result[f.name] = (f.optional && bp.readBit(o, bi)) ?
                f.defaultValue :
                f.bool ?
                !!bp.readBit(o, bi + f.optional) :
                f.type.decode(bp);
            
            bi += f.optional + f.bool;
        }

        return result;
    }

    getSchema(): Types.Schema {
        return {
            type: 'struct',
            orderedFields: this._fields.map(f => ({ name: f.name, type: f.type.getSchema() })),
        };
    }
}
