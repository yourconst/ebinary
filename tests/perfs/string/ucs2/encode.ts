import Measurer from '../../../../perfme/src';
import { BinaryBuffer } from '../../../src';
import { _native } from '../../../src/Encoder/BinaryBuffer/_native';
import { Helpers } from '../../utils2';

const ui8a = new Uint8Array([1, 2]);
const ui16a = new Uint16Array(ui8a.buffer);

const write = _native.endian === 'le' ?
    (v: number, b: Uint8Array, o: number) => {
        ui16a[0] = v;
        // b.set(ui8a, o); // slower
        b[o + 0] = ui8a[0];
        b[o + 1] = ui8a[1];
    } :
    (v: number, b: Uint8Array, o: number) => {
        ui16a[0] = v;
        b[o + 0] = ui8a[1];
        b[o + 1] = ui8a[0];
    };

export const f1 = (buf: Uint8Array, str: string, offset = 0) => {
    for (let i=0; i<str.length; ++i) {
        write(str.charCodeAt(i), buf, offset);
        offset += 2;
    }

    return offset;
};

export const f2 = _native.endian === 'le' ?
    function f2(buf: Uint8Array, str: string, offset = 0) {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset + 0] = c % 256;
            buf[offset + 1] = c >> 8;
            offset += 2;
        }

        return offset;
    } :
    function f2(buf: Uint8Array, str: string, offset = 0) {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset + 0] = c >> 8;
            buf[offset + 1] = c % 256;
            offset += 2;
        }

        return offset;
    };

export const f3 = _native.endian === 'le' ?
    function f3(buf: Uint8Array, str: string, offset = 0) {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset++] = c % 256;
            buf[offset++] = c >> 8;
        }

        return offset;
    } :
    function f3(buf: Uint8Array, str: string, offset = 0) {
        for (let i=0; i<str.length; ++i) {
            const c = str.charCodeAt(i);
            buf[offset++] = c >> 8;
            buf[offset++] = c % 256;
        }

        return offset;
    };

const f3native = (buf: BinaryBuffer, str: string, offset = 0) => str.length < 30 ? f3(buf, str, offset) : buf.ucs2Write!(str, offset);

// @ts-ignore
const fs = [f1, f2, f3, f3native, ..._native.encoders.ucs2.write ? [function native (buf, str: string, offset = 0) { return buf.ucs2Write(str, offset)}] : []]/* .reverse() */;

// const buf = Buffer.from(Helpers.Random.stringUTF8(100), 'ucs2');

// for (const f of fs) {
//     console.log(f(buf));
// }

async function main() {
    for (const length of [
        0,
        1,2,3,4,5,6,7,8,9,
        10,11,12,13,14,15,16,17,18,19,
        20,21,22,23,24,25,26,27,28,29,
        30,31,32,33,34,38,39,
        // 40,41,48,49,
        // 50,51,52,53,54,55,56,57,58,59,
        // 60,61,62,63,64,65,
        // 126,127,128,129,
        200,300,400,500,600,700,800,900,
    ]) {
        new Measurer(`UCS2 encode x${length}`, fs.map(f => new Measurer.MeasureShell({
            label: f.name,
            f,
            getParams: Measurer.Helpers.createCycleArrayRunner(
                Measurer.Helpers.generateArray(100, () => {
                    const str = Helpers.Random.stringUTF8(length);
                    const buf = Buffer.from(str, 'ucs2');
                    
                    return <[Buffer, string]> [buf, str];
                }),
            ),
        })))
            .warmup({ seriesCount: 10, seriesLength: 10000 })
            .measure({ seriesCount: 100, seriesLength: 10000}).printResult({ timeResolution: 'ns', memoryResolution: 'B' })
            // .reset()
            // .measure(100, 10000).printResultOrdered();
    }
}

// if (1 === Number.EPSILON) {
    main();
// }
