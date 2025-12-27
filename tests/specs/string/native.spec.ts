import { StringEncoders } from '../../../src/Encoder/BinaryBuffer';
import { _native } from '../../../src/Encoder/BinaryBuffer/_native';
import { Random } from '../../utils/helpers/common';
import { StringDecoder } from 'string_decoder';

import { expect } from 'chai';
describe('String', () => {
    describe('UTF8', () => {
        it('Success cases', () => {
            for (const i of [0, 1, 2, 3, 11, 15, 20, 50, 100, 1000, 10000, 100000]) {
                const str = Random.stringUTF8(i);

                const _length = StringEncoders.utf8._byteLength(str);
                const length = StringEncoders.utf8.byteLength(str);
                const nlength = Buffer.byteLength(str, 'utf8');

                expect(_length).to.deep.equal(nlength);
                expect(length).to.deep.equal(nlength);

                const _buffer = Buffer.allocUnsafe(length);
                const buffer = Buffer.allocUnsafe(length);

                StringEncoders.utf8._encodeInto(_buffer, str, 0);
                StringEncoders.utf8.encodeInto(buffer, str, 0);
                const nbuffer = Buffer.from(str, 'utf8');

                expect(_buffer).to.deep.equal(nbuffer);
                expect(buffer).to.deep.equal(nbuffer);

                const _decoded = StringEncoders.utf8._decode(nbuffer, 0, length);
                const decoded = StringEncoders.utf8.decode(nbuffer, 0, length);
                const ndecoded = nbuffer.toString('utf8');
                const sdecoded = new StringDecoder('utf8').end(nbuffer);

                expect(_decoded).to.deep.equal(str);
                expect(decoded).to.deep.equal(str);
                expect(ndecoded).to.deep.equal(str);
                expect(sdecoded).to.deep.equal(str);
            }
        });

        it('Fail cases', () => {

        });
    });

    describe('ASCII', () => {
        it('Success cases', () => {
            for (const i of [0, 1, 2, 3, 11, 15, 20, 50, 100, 1000, 10000, 100000]) {
                const str = Random.stringASCII(i);

                const _length = StringEncoders.ascii._byteLength(str);
                const length = StringEncoders.ascii.byteLength(str);
                const nlength = Buffer.byteLength(str, 'ascii');

                expect(_length).to.deep.equal(nlength);
                expect(length).to.deep.equal(nlength);

                const _buffer = Buffer.allocUnsafe(length);
                const buffer = Buffer.allocUnsafe(length);

                StringEncoders.ascii._encodeInto(_buffer, str, 0);
                StringEncoders.ascii.encodeInto(buffer, str, 0);
                const nbuffer = Buffer.from(str, 'ascii');

                expect(_buffer).to.deep.equal(nbuffer);
                expect(buffer).to.deep.equal(nbuffer);

                const _decoded = StringEncoders.ascii._decode(nbuffer, 0, length);
                const decoded = StringEncoders.ascii.decode(nbuffer, 0, length);
                const ndecoded = nbuffer.toString('ascii');
                const sdecoded = new StringDecoder('ascii').end(nbuffer);

                expect(_decoded).to.deep.equal(str);
                expect(decoded).to.deep.equal(str);
                expect(ndecoded).to.deep.equal(str);
                expect(sdecoded).to.deep.equal(str);
            }
        });

        it('Fail cases', () => {

        });
    });

    describe('UCS2', () => {
        it('Success cases', () => {
            for (const i of [0, 1, 2, 3, 11, 15, 20, 50, 100, 1000, 10000, 100000]) {
                const str = Random.stringUTF8(i);

                const _length = StringEncoders.ucs2._byteLength(str);
                const length = StringEncoders.ucs2.byteLength(str);
                const nlength = Buffer.byteLength(str, 'ucs2');

                expect(_length).to.deep.equal(nlength);
                expect(length).to.deep.equal(nlength);

                const _buffer = Buffer.allocUnsafe(length);
                const buffer = Buffer.allocUnsafe(length);

                StringEncoders.ucs2._encodeInto(_buffer, str, 0);
                StringEncoders.ucs2.encodeInto(buffer, str, 0);
                const nbuffer = Buffer.from(str, 'ucs2');

                expect(_buffer).to.deep.equal(nbuffer);
                expect(buffer).to.deep.equal(nbuffer);

                const _decoded = StringEncoders.ucs2._decode(nbuffer, 0, length);
                const decoded = StringEncoders.ucs2.decode(nbuffer, 0, length);
                const ndecoded = nbuffer.toString('ucs2');
                const sdecoded = new StringDecoder('ucs2').end(nbuffer);

                expect(_decoded).to.deep.equal(str);
                expect(decoded).to.deep.equal(str);
                expect(ndecoded).to.deep.equal(str);
                expect(sdecoded).to.deep.equal(str);
            }
        });

        it('Fail cases', () => {

        });
    });
});
