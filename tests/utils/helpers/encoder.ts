import type { Type as PBType } from 'protobufjs';
import * as OBE from 'binary-encoder';
import * as binio from 'binio';
import * as avsc from 'avsc';
import * as schemapack from 'schemapack';
import { _StringEncoding } from '../../../src/types/types';

export namespace Encoder {
  export interface IEncoder<T = any, R = Uint8Array> {
      readonly label: string;
      readonly encode: (value: T) => R;
      readonly decode: (buffer: R) => T;
  }

  export const getProtobuf = (type: PBType, label = 'Protobuf'): IEncoder => ({
      label,
      encode: (v) => type.encode(v).finish(),
      decode: (b) => type.decode(b),
  });

  export const getBinio = (type: binio.BTDSchema, label = 'binio'): IEncoder => {
      const e = binio.build(type);

      return {
          label,
          encode: (v) => e.encode(v),
          decode: (b) => e.decode(b),
      };
  };

  export const avscLongType = avsc.types.LongType.__with({
      fromBuffer: (buf) => new BigInt64Array(buf.buffer, buf.byteOffset, 1)[0],
      toBuffer: (n) => {
      //   const buf = Buffer.alloc(8);
      //   buf.writeBigInt64LE(n);
          const arr = new BigInt64Array([n]);
        return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
      },
      fromJSON: BigInt,
      toJSON: Number,
      isValid: (n) => typeof n == 'bigint',
      compare: (n1, n2) => { return n1 === n2 ? 0 : (n1 < n2 ? -1 : 1); }
  });

  export const getAvsc = (type: avsc.Schema, label = 'avsc'): IEncoder => {
      const e = avsc.Type.forSchema(type);

      return {
          label,
          encode: (v) => e.toBuffer(v),
          decode: (b) => e.fromBuffer(b as Buffer),
      };
  };

  export const getSchemapack = (type: binio.BTDSchema, label = 'schemapack'): IEncoder => {
      const e = schemapack.build(type);

      return {
          label,
          encode: (v) => e.encode(v),
          decode: (b) => e.decode(b),
      };
  };

  export const getOtherBinaryEncoder = (type: any, label = 'OtherBinaryEncoder'): IEncoder => ({
      label,
      encode: <any> OBE.compileEncoder(type),
      decode: <any> OBE.compileDecoder(type),
  });

  BigInt.prototype['toJSON'] = function() { return this.toString(); }

  export const getJSON = (label = 'JSON'): IEncoder<any, string> => ({
      label,
      encode: JSON.stringify,
      decode: JSON.parse,
  });

  export const getJSONBinary = (encoding: _StringEncoding, label = 'JSONBinary ' + encoding): IEncoder<any, Buffer> => ({
      label,
      encode: (v) => Buffer.from(JSON.stringify(v), encoding),
      decode: (b) => JSON.parse(b.toString(encoding)),
  });
}