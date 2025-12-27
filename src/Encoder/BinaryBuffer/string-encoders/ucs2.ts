import type { BinaryBuffer } from "..";
import { _native } from "../_native";

export const _byteLength = (s: string) => {
    return s.length * 2;
};

export const byteLength = _byteLength;

export const _encodeInto = _native.endian === 'le'
    ? (buf: Uint8Array, str: string, offset = 0) => {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset++] = c % 256;
            buf[offset++] = c >> 8;
        }

        return offset;
    }
    : (buf: Uint8Array, str: string, offset = 0) => {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset++] = c >> 8;
            buf[offset++] = c % 256;
        }

        return offset;
    };

export const encodeInto = _native.encoders.ucs2.write
    ? ((buf: BinaryBuffer, str: string, offset = 0) => str.length < 30 ? _encodeInto(buf, str, offset) : buf.ucs2Write(str, offset))
    : _encodeInto;

const MAX_ARGUMENTS_LENGTH = 0x1000;

export const _decode = (buf: Uint8Array, start = 0, end = buf.length) => {
    end = Math.min(buf.length, end);

    const points = new Uint16Array(buf.buffer, buf.byteOffset + start, (end - start) >> 1);

    if (points.length < MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(
            String,
            points,
        );
    }

    let res = '';
    start = 0;
    while (start < points.length) {
        const partEnd = Math.min(points.length, start + MAX_ARGUMENTS_LENGTH);

        res += String.fromCharCode.apply(
            String,
            points.subarray(start, partEnd),
        );

        start = partEnd;
    }

    return res;
}

const sd = _native.tryCreateStringDecoder('ucs2');

export const decode = sd
    ? (buf: Uint8Array, start = 0, end = buf.length) => sd.end(buf as any)
    : _decode;
