import Measurer from '../../../../perfme/src';
import { _native } from '../../../src/Encoder/BinaryBuffer/_native';
import { Helpers } from '../../utils2';
import { StringDecoder } from 'node:string_decoder';

const MAX_ARGUMENTS_LENGTH = 0x1000;

const f1 = (buf: Uint8Array, start = 0, end = buf.length) => {
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
};

const f2 = (buf: Uint8Array, start = 0, end = buf.length) => {
    end = Math.min(buf.length, end);

    const points = new Uint16Array(buf.buffer, buf.byteOffset + start, (end - start) >> 1);

    if (points.length < MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(
            String,
            points,
        );
    }

    const res: string[] = [];
    start = 0;
    while (start < points.length) {
        const partEnd = Math.min(points.length, start + MAX_ARGUMENTS_LENGTH);
        res.push(String.fromCharCode.apply(
            String,
            points.subarray(start, partEnd),
        ));

        start = partEnd;
    }

    return res.join('');
};

const sd = new StringDecoder('ucs2');
const decoder = (buf: Buffer, start = 0, end = buf.length) => sd.end(buf.slice(start, end));
const decoder2 = (buf: Buffer, start = 0, end = buf.length) => sd.end(new Uint8Array(buf.buffer, buf.byteOffset + start, end - start) as any);
const decoder3 = (buf: Buffer, start = 0, end = buf.length) => sd.end(Buffer.from(buf.buffer, buf.byteOffset + start, end - start));
const decoderNoOffset = (buf: Buffer) => sd.end(buf);
const decoderNoOffsetBind = sd.end.bind(sd);
// @ts-ignore
const fs = [f1, f2, decoder, decoder2, decoder3, decoderNoOffset, decoderNoOffsetBind, ..._native.encoders.ucs2.slice ? [function native (buf) { return buf.ucs2Slice()}] : []]/* .reverse() */;

// const buf = Buffer.from(Helpers.Random.stringUTF8(100), 'ucs2');

// for (const f of fs) {
//     console.log(f(buf));
// }

async function main() {
    for (const length of [
        0,
        1,2,3,4,5,6,7,8,9,
        10,11,12,13,14,15,16,17,18,19,
        20,21,29,
        30,31,32,33,34,38,39,
        40,41,48,49,
        50,51,52,53,54,55,56,57,58,59,
        60,61,62,63,64,65,
        126,127,128,129,
        200,300,400,500,600,700,800,900,
    ]) {
        new Measurer(`UCS2 decode x${length}`, fs.map(f => new Measurer.MeasureShell({
            label: f.name,
            f,
            getParams: Measurer.Helpers.createCycleArrayRunner(
                Measurer.Helpers.generateArray(100, () => (<[Buffer]> [Buffer.from(Helpers.Random.stringUTF8(length), 'ucs2')])),
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
