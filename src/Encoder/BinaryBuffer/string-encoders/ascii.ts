import type { BinaryBuffer } from '..';
import { BufferPointer } from '../../BufferPointer';
import { _native } from '../_native';

export const byteLength = (src: string) => {
    return src.length;
}

export const _encodeInto = (buf: Uint8Array, str: string, offset = 0) => {
    for (let i = 0; i < str.length; ++i) {
        buf[offset + i] = str.charCodeAt(i);
    }

    return offset + str.length;
}

export const encodeInto = _native.encoders.ascii.write ?
    (buf: BinaryBuffer, str: string, offset = 0) => buf.asciiWrite(str, offset) :
    _encodeInto;

export const encode = (src: string, units = src.length) => {
    const result = new Array<number>(units);
    
    for (let i = 0; i < src.length; ++i) {
        result[i] = src.charCodeAt(i);
    }

    return result;
    // return [...(src.length > units ? src.slice(0, units) : src)].map(c => c.charCodeAt(0));
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const MAX_ARGUMENTS_LENGTH = 0x1000;

export const decode = (buf: Uint8Array, start = 0, end = buf.length) => {
    end = Math.min(buf.length, end);

    if (end - start < MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(
            String,
            buf.subarray(start, end),
        );
    }

    // const res: string[] = [];
    let res = '';
    while (start < end) {
        const partEnd = Math.min(end, start + MAX_ARGUMENTS_LENGTH);
        // res.push(String.fromCharCode.apply(
        //     String,
        //     buf.subarray(start, partEnd),
        // ));

        res += String.fromCharCode.apply(
            String,
            buf.subarray(start, partEnd),
        );

        start = partEnd;
    }
    // return res.join('');
    return res;
}
