const { expect } = require('chai');

// Make expect available globally for Mocha tests
global.expect = expect;

// Setup NO_EVAL environment handling
if (process.env.NO_EVAL === 'true' && globalThis.Function) {
    // @ts-ignore
    globalThis.Function = null;
    // console.log('NO_EVAL');
}

// Override describe to add NO_EVAL prefix when needed
if (globalThis.describe) {
    const originalDescribe = globalThis.describe;

    const prefix = process.env.NO_EVAL ? 'NO_EVAL: ' : '';

    // @ts-expect-error
    globalThis.describe = function (param1, fn) {
        if (typeof param1 === 'string') {
            param1 = `${prefix}${param1}`;
        }

        return originalDescribe(param1, fn);
    }

    globalThis.describe.only = originalDescribe.only;
    globalThis.describe.skip = originalDescribe.skip;
    globalThis.describe.each = originalDescribe.each;
}