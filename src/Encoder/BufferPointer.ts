import { BinaryBuffer } from './BinaryBuffer';

export class BufferPointer {
    constructor(readonly buffer: BinaryBuffer, private _ptr = 0) {}

    get() {
        return this._ptr;
    }
    
    add(offset: number) {
        this._ptr += offset;
        return this._ptr;
    }

    getAdd(offset: number) {
        const current = this._ptr;
        this._ptr += offset;
        return current;
    }

    fill(byte: number, size: number) {
        this.buffer.fill(byte, this._ptr, this._ptr + size);
        this._ptr += size;
        return this;
    }

    writeByte(byte: number) {
        this.buffer[this._ptr++] = byte;
        return this;
    }

    readByte() {
        return this.buffer[this._ptr++];
    }

    writeBit(bit: 0 | 1 | boolean, byteOffset: number, bitOffset: number) {
        byteOffset += bitOffset >>> 3;
        bitOffset %= 8;
        this.buffer[byteOffset] = (this.buffer[byteOffset] & (~(1 << bitOffset))) | ((<number>bit) << bitOffset);
        return this;
    }

    writeBit1(byteOffset: number, bitOffset: number) {
        this.buffer[byteOffset + (bitOffset >>> 3)] |= 1 << (bitOffset % 8);
        return this;
    }

    writeBit0(byteOffset: number, bitOffset: number) {
        this.buffer[byteOffset + (bitOffset >>> 3)] &= ~(1 << (bitOffset % 8));
        return this;
    }

    readBit(byteOffset: number, bitOffset: number) {
        return (this.buffer[byteOffset + (bitOffset >>> 3)] >>> (bitOffset % 8)) & 1;
    }
}
