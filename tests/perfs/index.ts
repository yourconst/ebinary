// globalThis.Function = null;

import { Encoder, Type } from "../../src";
import { Type as PBType, Field, Enum } from "protobufjs";
import * as BE from "binary-encoder";
import { Helpers, Test } from "../utils";
import binio from "binio";

const TEST_COUNT = 5e3;
const TEST_REPEAT_COUNT = 100;
// const DATA_ARRAY_SIZE = 100;

enum TypeEnum {
  "a" = "a",
  "b" = "b",
  "c" = "c",
}

const pbTypeEnum = Object.fromEntries(
  Object.values(TypeEnum).map((v, i) => [v, i])
);

const randEnum = () =>
  [TypeEnum.a, TypeEnum.b, TypeEnum.c][Helpers.Random.uint(3)];


for (const DATA_ARRAY_SIZE of [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 1000]) {
// Test.test("Array of varint32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.VarInt32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "int32", "repeated"))
//       ),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int32()),
//   })
// );

// Test.test("Array of uvarint32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UVarInt32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "uint32", "repeated"))
//       ),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint32()),
//   })
// );

// Test.test("Array of (just 31 bit using) varint32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.VarInt32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "int32", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["varint"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int(-1073741824, 1073741823)),
//   })
// );

// Test.test("Array of (just 31 bit using) uvarint32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UVarInt32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "uint32", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["varuint"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint(2147483647)),
//   })
// );

// Test.test("Array of int8",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Int8()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getBinio({
//         array: ["int8"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int8()),
//   })
// );

// Test.test("Array of uint8",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UInt8()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getBinio({
//         array: ["uint8"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint8()),
//   })
// );

// Test.test("Array of int16",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Int16()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getBinio({
//         array: ["int16"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int16()),
//   })
// );

// Test.test("Array of uint16",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UInt16()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getBinio({
//         array: ["uint16"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint16()),
//   })
// );

// Test.test("Array of int32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Int32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "sfixed32", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["int32"],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "int",
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int32()),
//   })
// );

// Test.test("Array of uint32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UInt32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "fixed32", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["uint32"],
//       }),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint32()),
//   })
// );

// Test.test("Array of int64",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Int64()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "sfixed64", "repeated"))
//       ),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.int64()),
//   })
// );

// Test.test("Array of uint64",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.UInt64()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "fixed64", "repeated"))
//       ),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.uint64()),
//   })
// );

// Test.test("Array of float32",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Float32()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "float", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["float32"],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "float",
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.float32()),
//   })
// );

// Test.test("Array of float64",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.Float64()),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "double", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["float64"],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "double",
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.float64()),
//   })
// );

// Test.test(`Array of strings (string length = ${strLength})`,
//   {
//     count: TEST_COUNT / 50,
//     repeatCount: TEST_REPEAT_COUNT,
//     jsonBinaryEncoding: null,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(Type.String('utf8')),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(new Field("array", 1, "string", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: ["string"],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "string",
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => Helpers.Random.stringUTF8(strLength)),
//   })
// );

// throw new Error();

Test.test(`Struct with numbers (length = ${DATA_ARRAY_SIZE})`,
  {
    count: TEST_COUNT,
    repeatCount: TEST_REPEAT_COUNT,
    jsonBinaryEncoding: null,
    binaryEncoder: new Encoder(
      Type.Struct({
        array: Type.Array(
          Type.Struct({
            id: Type.Int32(),
            count: Type.UInt32(),
            enabled: Type.Bool(),
          })
        ),
      })
    ),
    otherEncoders: [
      Helpers.Encoder.getProtobuf(
        new PBType("ArrayStruct")
          .add(
            new PBType("Struct")
              .add(new Field("id", 1, "sfixed32"))
              .add(new Field("count", 3, "fixed32"))
              .add(new Field("enabled", 4, "bool"))
          )
          .add(new Field("array", 1, "Struct", "repeated"))
      ),
      Helpers.Encoder.getBinio({
        array: [
          {
            id: "int32",
            count: "uint32",
            enabled: "bool",
          },
        ],
      }),
      Helpers.Encoder.getSchemapack({
        array: [
          {
            id: "int32",
            count: "uint32",
            enabled: "bool",
          },
        ],
      }),
      Helpers.Encoder.getAvsc({
        type: "record",
        fields: [
          {
            name: "array",
            type: {
              type: "array",
              items: {
                type: "record",
                fields: [
                  { name: "id", type: "int" },
                  { name: "count", type: "long" },
                  { name: "enabled", type: "boolean" },
                ],
              },
            },
          },
        ],
      } as any),
    ],
  },
  () => ({
    array: Helpers.generateArray(DATA_ARRAY_SIZE, () => ({
      id: Helpers.Random.int32(),
      count: Helpers.Random.uint32(),
      enabled: Helpers.Random.bool(),
    })),
  })
);

// Test.test("Struct",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(
//           Type.Struct({
//             id: Type.Int32(),
//             type: Type.Enum(TypeEnum),
//             count: Type.UInt32(),
//             enabled: Type.Bool(),
//           })
//         ),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(
//             new PBType("Struct")
//               .add(new Enum("TypeEnum", pbTypeEnum))
//               .add(new Field("id", 1, "sfixed32"))
//               .add(new Field("type", 2, "TypeEnum"))
//               .add(new Field("count", 3, "fixed32"))
//               .add(new Field("enabled", 4, "bool"))
//           )
//           .add(new Field("array", 1, "Struct", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: [
//           {
//             id: "int32",
//             type: "string",
//             count: "uint32",
//             enabled: "bool",
//           },
//         ],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "record",
//                 fields: [
//                   { name: "id", type: "int" },
//                   {
//                     name: "type",
//                     type: {
//                       type: "enum",
//                       name: "TypeEnum",
//                       symbols: Object.values(TypeEnum),
//                     },
//                   },
//                   { name: "count", type: "long" },
//                   { name: "enabled", type: "boolean" },
//                 ],
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE /* Helpers.Random.int(70, 100) */, () => ({
//       id: Helpers.Random.int32(), // int(-1010, -1000),
//       type: randEnum(),
//       count: Helpers.Random.uint32(), // int(1000, 1010),
//       enabled: Helpers.Random.bool(),
//     })),
//   })
// );

// Test.test("Struct with bigint",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: Type.Array(
//           Type.Struct({
//             id: Type.Int32(),
//             type: Type.Enum(TypeEnum),
//             count: Type.UInt32(),
//             enabled: Type.Bool(),
//             bigint: Type.Int64(),
//           })
//         ),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStruct")
//           .add(
//             new PBType("Struct")
//               .add(new Enum("TypeEnum", pbTypeEnum))
//               .add(new Field("id", 1, "sfixed32"))
//               .add(new Field("type", 2, "TypeEnum"))
//               .add(new Field("count", 3, "fixed32"))
//               .add(new Field("enabled", 4, "bool"))
//               // .add(new Field('enabled', 4, 'bool', 'optional'))
//               .add(new Field("bigint", 5, "sfixed64"))
//           )
//           .add(new Field("array", 1, "Struct", "repeated"))
//       ),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "record",
//                 fields: [
//                   { name: "id", type: "int" },
//                   {
//                     name: "type",
//                     type: {
//                       type: "enum",
//                       name: "TypeEnum",
//                       symbols: Object.values(TypeEnum),
//                     },
//                   },
//                   { name: "count", type: "long" },
//                   { name: "enabled", type: "boolean" },
//                   { name: "bigint", type: Helpers.Encoder.avscLongType },
//                   // { name: 'bigint', type: 'long' },
//                 ],
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => ({
//       id: Helpers.Random.int32(),
//       type: randEnum(),
//       count: Helpers.Random.uint32(),
//       enabled: Helpers.Random.bool(),
//       bigint: Helpers.Random.bigInt(),
//     })),
//   })
// );

// Test.test("Struct with string (utf8)",
//   {
//     count: TEST_COUNT,
//     repeatCount: TEST_REPEAT_COUNT,
//     binaryEncoder: new Encoder(
//       Type.Struct({
//         array: /* Type.Optional */ Type.Array(
//           Type.Struct({
//             id: /* Type.Optional */ Type.Int32(),
//             type: /* Type.Optional */ Type.Enum(TypeEnum),
//             count: /* Type.Optional */ Type.UInt32(),
//             enabled: /* Type.Optional */ Type.Bool(), // Type.Bool(), //
//             str: /* Type.Optional */ /* Type.LowCardinality */ Type.String(
//               "utf8"
//             ),
//           })
//         ),
//       })
//     ),
//     otherEncoders: [
//       Helpers.Encoder.getProtobuf(
//         new PBType("ArrayStructWithString")
//           .add(
//             new PBType("StructWithString")
//               .add(new Enum("TypeEnum", pbTypeEnum))
//               .add(new Field("id", 1, "sfixed32"))
//               .add(new Field("type", 2, "TypeEnum"))
//               .add(new Field("count", 3, "fixed32"))
//               .add(new Field("enabled", 4, "bool", "optional"))
//               .add(new Field("str", 5, "string"))
//           )
//           .add(new Field("array", 1, "StructWithString", "repeated"))
//       ),
//       Helpers.Encoder.getBinio({
//         array: [
//           {
//             id: "int32",
//             type: "string",
//             count: "uint32",
//             enabled: "bool",
//             str: "string",
//           },
//         ],
//       }),
//       Helpers.Encoder.getAvsc({
//         type: "record",
//         fields: [
//           {
//             name: "array",
//             type: {
//               type: "array",
//               items: {
//                 type: "record",
//                 fields: [
//                   { name: "id", type: "int" },
//                   {
//                     name: "type",
//                     type: {
//                       type: "enum",
//                       name: "TypeEnum",
//                       symbols: Object.values(TypeEnum),
//                     },
//                   },
//                   { name: "count", type: "long" },
//                   { name: "enabled", type: "boolean" },
//                   { name: "str", type: "string" },
//                 ],
//               },
//             },
//           },
//         ],
//       } as any),
//     ],
//   },
//   () => ({
//     array: Helpers.generateArray(DATA_ARRAY_SIZE, () => ({
//       id: Helpers.Random.int32(),
//       type: randEnum(),
//       count: Helpers.Random.uint32(),
//       enabled: Helpers.Random.bool(),
//       // str: Helpers.Random.stringUTF8(Helpers.Random.int(10, 49)),
//       str: Helpers.Random.element([
//         "hellow 1 string mfk",
//         "asidjn ihaidshiahsdo iahsd iohiadsh ihuashi oasd",
//         "asdiadios adisadshi2394890n9837  230idsfa",
//         "asdiadios adisadshiasd asd asd 2394890n9837  230idsfa",
//         "asdiadios adisadshi2 aslkhba ii37u yo8o8 g 8A*GS&D8 7893aos diuyyag sd*&  G89873 q9687 ",
//       ]).slice(0),
//     })),
//   })
// );
}
