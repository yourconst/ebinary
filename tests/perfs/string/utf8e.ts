import { Helpers, Measuring } from '../utils2';

const f1 = (buf: Uint8Array, str: string, offset = 0) => {
    var c1,
        c2;
    for (var i = 0; i < str.length; ++i) {
        c1 = str.charCodeAt(i);
        if (c1 < 128) {
            buf[offset++] = c1;
        } else if (c1 < 2048) {
            buf[offset++] = c1 >> 6       | 192;
            buf[offset++] = c1       & 63 | 128;
        } else if ((c1 & 0xFC00) === 0xD800 && ((c2 = str.charCodeAt(i + 1)) & 0xFC00) === 0xDC00) {
            c1 = 0x10000 + ((c1 & 0x03FF) << 10) + (c2 & 0x03FF);
            ++i;
            buf[offset++] = c1 >> 18      | 240;
            buf[offset++] = c1 >> 12 & 63 | 128;
            buf[offset++] = c1 >> 6  & 63 | 128;
            buf[offset++] = c1       & 63 | 128;
        } else {
            buf[offset++] = c1 >> 12      | 224;
            buf[offset++] = c1 >> 6  & 63 | 128;
            buf[offset++] = c1       & 63 | 128;
        }
    }
    return offset;
};

// https://github.com/LinusU/encode-utf8/blob/master/index.js
const f2 = (buf: Uint8Array, input: string, offset = 0) => {
    const size = input.length;
  
    for (let index = 0; index < size; index++) {
        let point = input.charCodeAt(index);
    
        if (point >= 0xD800 && point <= 0xDBFF && size > index + 1) {
            const second = input.charCodeAt(index + 1);
    
            if (second >= 0xDC00 && second <= 0xDFFF) {
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                point = (point - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                index += 1;
            }
        }
    
        // US-ASCII
        if (point < 0x80) {
            buf[offset++] = point;
            continue;
        }
    
        // 2-byte UTF-8
        if (point < 0x800) {
            buf[offset++] = (point >> 6) | 192;
            buf[offset++] = (point & 63) | 128;
            continue;
        }
    
        // 3-byte UTF-8
        if (point < 0xD800 || (point >= 0xE000 && point < 0x10000)) {
            buf[offset++] = (point >> 12) | 224;
            buf[offset++] = ((point >> 6) & 63) | 128;
            buf[offset++] = (point & 63) | 128;
            continue;
        }
    
        // 4-byte UTF-8
        if (point >= 0x10000 && point <= 0x10FFFF) {
            buf[offset++] = (point >> 18) | 240;
            buf[offset++] = ((point >> 12) & 63) | 128;
            buf[offset++] = ((point >> 6) & 63) | 128;
            buf[offset++] = (point & 63) | 128;
            continue;
        }
    
        // Invalid character
        buf[offset++] = 0xEF, 0xBF, 0xBD;
    }
    
    return offset;
};

// https://github.com/LinusU/encode-utf8/blob/master/index.js
const f21 = (buf: Uint8Array, input: string, offset = 0) => {
    const size = input.length;
  
    for (let index = 0; index < size; index++) {
        let point = input.charCodeAt(index);
    
        if (point >= 0xD800 && point <= 0xDBFF && size > index + 1) {
            const second = input.charCodeAt(index + 1);
    
            if (second >= 0xDC00 && second <= 0xDFFF) {
                // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                point = (point - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                index += 1;
            }
        }
    
        // US-ASCII
        if (point < 0x80) {
            buf[offset++] = point;
        } else
        // 2-byte UTF-8
        if (point < 0x800) {
            buf[offset++] = (point >> 6) | 192;
            buf[offset++] = (point & 63) | 128;
        } else
        // 3-byte UTF-8
        if (point < 0xD800 || (point >= 0xE000 && point < 0x10000)) {
            buf[offset++] = (point >> 12) | 224;
            buf[offset++] = ((point >> 6) & 63) | 128;
            buf[offset++] = (point & 63) | 128;
        } else
        // 4-byte UTF-8
        if (point >= 0x10000 && point <= 0x10FFFF) {
            buf[offset++] = (point >> 18) | 240;
            buf[offset++] = ((point >> 12) & 63) | 128;
            buf[offset++] = ((point >> 6) & 63) | 128;
            buf[offset++] = (point & 63) | 128;
        } else {
            // Invalid character
            buf[offset++] = /* 0xEF, 0xBF,  */0xBD;
        }
    }
    
    return offset;
};

// https://github.com/mathiasbynens/utf8.js/blob/master/utf8.js
const f3 = (buf: Uint8Array, str: string, offset = 0) => {
    var counter = 0;
    var length = str.length;
    var value;
    var extra;
    while (counter < length) {
        value = str.charCodeAt(counter++);
        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // high surrogate, and there is a next character
            extra = str.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                buf[offset++] = ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
            } else {
                // unmatched surrogate; only append this code unit, in case the next
                // code unit is the high surrogate of a surrogate pair
                buf[offset++] = value;
                counter--;
            }
        } else {
            buf[offset++] = value;
        }
    }

    return offset;
}

// https://www.webtoolkit.info/javascript_utf8.html
const f4 = (buf: Uint8Array, str: string, offset = 0) => {
    for (var n = 0; n < str.length; n++) {
        var c = str.charCodeAt(n);

        if (c < 128) {
            buf[offset++] = c;
        } else
        if(c < 2048) {
            buf[offset++] = (c >> 6) | 192;
            buf[offset++] = (c & 63) | 128;
        } else {
            buf[offset++] = (c >> 12) | 224;
            buf[offset++] = ((c >> 6) & 63) | 128;
            buf[offset++] = (c & 63) | 128;
        }
    }

    return offset;
};

const f5 = (buf: Uint8Array, str: string, offset = 0) => {
    let i = 0;
    let cp;

    while (cp = str.codePointAt(i++)) {
        buf[offset + i] = cp;
    }

    return offset + i;
};

const writeWE = (buf: Buffer, str: string, offset = 0) => buf.write(str, offset, 'utf8');
const write = (buf: Buffer, str: string, offset = 0) => buf.write(str, offset);
const utf8Write = (buf: Uint8Array, str: string, offset = 0) => (<any>buf).utf8Write(str, offset);

const te = new TextEncoder();

const textEncoder = (buf: Uint8Array, str: string, offset = 0) => te.encodeInto(str, new Uint8Array(buf.buffer, buf.byteOffset + offset)).written + offset;

const fs = [writeWE, write, utf8Write/* , textEncoder */, f3, f4, f1, f5, f2, f21]/* .reverse() */;

async function main() {
    for (const length of [
        0,
        1,2,3,4,5,6,7,8,9,
        10,15,16,17,18,19,
        20,21,29,
        30,31,32,33,34,38,39,
        40,41,48,49,
        50,51,52,53,54,55,56,57,58,59,
        60,61,62,63,64,65,
        126,127,128,129,
        200,300,400,500,600,700,800,900,
        1000, 2000, 3000, 4000,
    ]) {
        const data = Helpers.generateArray(100, () => {
            const str = Helpers.Random.stringUTF8(length);
            return <[Buffer, string]> [Buffer.from(str), str];
        });

        new Measuring.Measurer(`UTF8 Length x${length}`, fs.map(f => new Measuring.MeasureShell(
            f.name,
            f,
            Helpers.createCycleArrayRunner(data),
        )))
            .warmup(10, 10000)
            .measureBulk(100, 10000).printResultOrdered()
            // .reset()
            // .measure(100, 10000).printResultOrdered()
            ;
        
        console.log(Helpers.Random.element(data.map(d => [d[0].toString(), d[1]])).length);
    }
}

main();
