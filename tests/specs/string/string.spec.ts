import { Encoder, Type } from "../../../src";
import { Random } from "../../utils/helpers/common";
import { expect } from 'chai';

function expectSuccessStringEncoding(e: Encoder<{ type: 'string' }>, str: string) {
    expect(() => e.decode(e.encode(str))).not.to.throw();
    expect(e.decode(e.encode(str))).to.deep.equal(str);

    expect(() => e.decode(e.validateEncode(str))).not.to.throw();
    expect(e.decode(e.validateEncode(str))).to.deep.equal(str);
}

function expectWrongStringEncoding(e: Encoder<{ type: 'string' }>, str: string) {
    expect(e.decode(e.encode(str))).not.to.deep.equal(str);
    expect(e.decode(e.validateEncode(str))).not.to.deep.equal(str);
}

function expectFailStringEncoding(e: Encoder<{ type: 'string' }>, str: string) {
    // expect(() => e.decode(e.encode(str))).to.throw();
    expect(() => e.decode(e.validateEncode(str))).to.throw();
}

describe('String', () => {
    describe('UTF8', () => {
        describe('length: UVarInt32', () => {
            const e = new Encoder(Type.String('utf8', Type.UVarInt32()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '😊');
                expectSuccessStringEncoding(e, 'a😊😊😊a');
                expectSuccessStringEncoding(e, 'уa😊😊😊aу');
                expectSuccessStringEncoding(e, Random.stringUTF8(12345));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, 'уa😊😊😊aу' + '😊'[0] + '😊'[0]);
            });
        });

        describe('length: UInt8', () => {
            const e = new Encoder(Type.String('utf8', Type.UInt8()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '😊');
                expectSuccessStringEncoding(e, 'a😊😊😊a');
                expectSuccessStringEncoding(e, 'уa😊😊😊aу');
                expectSuccessStringEncoding(e, Random.stringASCII(255));
                expectSuccessStringEncoding(e, Random.stringUTF8(63));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, 'уa😊😊😊aу' + '😊'[0] + '😊'[0]);
                expectFailStringEncoding(e, Random.stringASCII(256));
                expectFailStringEncoding(e, Random.stringASCII(257));
                expectFailStringEncoding(e, Random.stringUTF8(256));
                expectFailStringEncoding(e, Random.stringUTF8(257));
            });
        });

        describe('length: UInt16', () => {
            const e = new Encoder(Type.String('utf8', Type.UInt16()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '😊');
                expectSuccessStringEncoding(e, 'a😊😊😊a');
                expectSuccessStringEncoding(e, 'уa😊😊😊aу');
                expectSuccessStringEncoding(e, Random.stringASCII(2**16-1));
                expectSuccessStringEncoding(e, Random.stringUTF8(2**14-1));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, 'уa😊😊😊aу' + '😊'[0] + '😊'[0]);
                expectFailStringEncoding(e, Random.stringASCII(2**16));
                expectFailStringEncoding(e, Random.stringASCII(2**16 + 1));
                expectFailStringEncoding(e, Random.stringUTF8(2**16));
                expectFailStringEncoding(e, Random.stringUTF8(2**16 + 1));
            });
        });
    });

    describe('ASCII', () => {
        describe('length: UVarInt32', () => {
            const e = new Encoder(Type.String('ascii', Type.UVarInt32()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '123asd[]{}-=_+/\\');
                expectSuccessStringEncoding(e, Random.stringASCII(12345));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, '😊');
                expectWrongStringEncoding(e, 'у😊');
            });
        });

        describe('length: UInt8', () => {
            const e = new Encoder(Type.String('ascii', Type.UInt8()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '123asd[]{}-=_+/\\');
                expectSuccessStringEncoding(e, Random.stringASCII(255));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, '😊');
                expectWrongStringEncoding(e, 'у😊');
                expectFailStringEncoding(e, Random.stringASCII(256));
                expectFailStringEncoding(e, Random.stringASCII(257));
            });
        });

        describe('length: UInt16', () => {
            const e = new Encoder(Type.String('ascii', Type.UInt16()));

            it('Success cases', () => {
                expectSuccessStringEncoding(e, '');
                expectSuccessStringEncoding(e, '1');
                expectSuccessStringEncoding(e, '123asd[]{}-=_+/\\');
                expectSuccessStringEncoding(e, Random.stringASCII(2**16-1));
            });

            it('Fail cases', () => {
                expectWrongStringEncoding(e, '😊');
                expectWrongStringEncoding(e, 'у😊');
                expectFailStringEncoding(e, Random.stringASCII(2**16));
                expectFailStringEncoding(e, Random.stringASCII(2**16+1));
            });
        });
    });
});
