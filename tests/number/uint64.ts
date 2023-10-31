import { Encoder, Type } from "../../src";
import { Helpers, Test } from "../utils2";
import { Type as PBType, Field, Enum } from 'protobufjs';
import * as BE from 'binary-encoder';

for (let i = 0; i <= 11; ++i) {
    const count = 2 ** i;
    Test.test(
        {
            label: `UInt64 x ${count}`,
            count: 5e3,
            repeatCount: 100,
            binaryEncoder: new Encoder(Type.Struct({
                array: Type.Array(Type.UInt64()),
            })),
            otherEncoders: [
                Helpers.Encoder.getProtobuf(
                    new PBType('Message')
                        .add(new Field('array', 1, 'fixed64', 'repeated')),
                ),
                // ...(count * 4 < 4096) ? [Helpers.Encoder.getOtherBinaryEncoder(BE.Structure({
                //     array: BE.Array(BE.UInt64()),
                // }))] : [],
            ],
            json: false,
            jsonBinaryEncoding: 'utf8',
            showBufferSize: true,
        },
        Helpers.generateArray(100, () => ({
            array: Helpers.generateArray(count, () => Helpers.Random.uint64()),
        })),
    );
}