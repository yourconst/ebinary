import Measurer from "perfme";
import { BinaryEncoder, CustomBinaryBuffer, Type } from "../../src";
import { argd } from "../../src/Encoder/argd";
import { Schema } from "../../src/types";
import { _StringEncoding } from "../../src/types/types";
import * as Helpers from "./helpers";
import printab from "printab";
import { applyColor } from "printab/dist/helpers/console";

import zlib from 'zlib';

export namespace Test {
    export function test<T extends Type.Schema>(label: string, {
        repeatCount = argd.testRepeatCount || 100,
        count = argd.testCount || 1000,
        warmupRepeatCount = 10,
        warmupCount = 1000,
        showBufferSize = true,
        showEncodeTime = true,
        showDecodeTime = true,
        binaryEncoder,
        otherEncoders = [],
        json = false,
        jsonBinaryEncoding = 'ucs2',
    }: {
        repeatCount?: number;
        count?: number;
        warmupRepeatCount?: number;
        warmupCount?: number;
        showBufferSize?: boolean;
        showEncodeTime?: boolean;
        showDecodeTime?: boolean;
        binaryEncoder: BinaryEncoder<T>;
        otherEncoders?: Helpers.Encoder.IEncoder<Type.SchemaResultType<T>>[];
        json?: boolean;
        jsonBinaryEncoding?: _StringEncoding | null;
    }, valueGenerator: (index?: number) => Type.SchemaResultType<T>) {
        const values = Helpers.generateArray(count, valueGenerator);
        // const customBinaryEncoder = new BinaryEncoder(binaryEncoder.getSchema(), CustomBinaryBuffer);

        const name = argd.CustomBinaryBuffer ? 'Custom' : 'Standard';

        const encoders: Helpers.Encoder.IEncoder<Type.SchemaResultType<T>, Uint8Array | Buffer | string>[] = [
            { label: applyColor('green', `EB ${name} +validate`), encode: binaryEncoder.validateEncode, decode: <any> null },
            // { label: applyColor('green', 'EB Custom +validate'), encode: customBinaryEncoder.validateEncode, decode: <any> null },
            { label: applyColor('green', `EB ${name}`), encode: binaryEncoder.encode, decode: binaryEncoder.decode },
            // { label: applyColor('green', 'EB Custom'), encode: customBinaryEncoder.encode, decode: customBinaryEncoder._decode },
            ...otherEncoders,
            ...json ? [
                <any> Helpers.Encoder.getJSON(),
            ] : [],
            ...jsonBinaryEncoding ? [
                <any> Helpers.Encoder.getJSONBinary(jsonBinaryEncoding),
            ] : [],
        ];

        if (showBufferSize) {
            printab(
                encoders.map(e => {
                    const m = new Measurer.Measurement(e.label);
                    const mz = new Measurer.Measurement(e.label);

                    for (const v of values) {
                        const b = e.encode(v);
                        // console.log(e.label, '\n', v, '\n', e.decode?.(b));
                        m.update(b.length);
                        mz.update(zlib.gzipSync(Buffer.from(b), { level: 9 }).length);
                    }

                    return {
                        ...m.toJSON(),
                        'gzip:': '',
                        zavg: mz.avg,
                        zmin: mz.min,
                        zmax: mz.max,
                    };
                }),
                {
                    header: { name: 'Buffer size: ' + label, color: 'lightblue' },
                    columns: ['label', 'avg', 'min', 'max', 'gzip:', 'zavg', 'zmin', 'zmax'],
                    order: [{field: 'avg'}, {field: 'max'}, {field: 'min'}],
                },
            );
        }

        if (showEncodeTime) {
            const valuesAsArgs: [Type.SchemaResultType<T>][] = values.map(v => ([v]));
            new Measurer('Encode time: ' + label, encoders.map(e => new Measurer.MeasureShell({
                label: e.label,
                f: e.encode,
                getParams: Measurer.Helpers.createCycleArrayRunner(valuesAsArgs),
            })))
                .warmup({ seriesCount: warmupRepeatCount, seriesLength: warmupCount })
                .measure({ seriesCount: repeatCount, seriesLength: count })
                .printResult()
                /* .reset()
                .measureBulk(repeatCount, count)
                .printResultOrdered() */;
            }

        if (showDecodeTime) {
            new Measurer('Decode time: ' + label, encoders.filter(e => e.decode).map(e => ({
                label: e.label,
                f: e.decode,
                getParams: Helpers.createCycleArrayRunner(values.map(v => (<[Buffer]>[Buffer.from(e.encode(v))]))),
            })))
                .warmup({ seriesCount: warmupRepeatCount, seriesLength: warmupCount })
                .measure({ seriesCount: repeatCount, seriesLength: count })
                .printResult();
            }
    }
}
