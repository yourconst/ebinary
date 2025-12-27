export namespace Random {
    export const number = (min = 0, max = 1) => min + (max - min) * Math.random();
    export const int = (min = -(2 ** 51), max = (2 ** 51) - 1) => Math.trunc(number(min, max));
    export const uint = (max?: number, min = 0) => int(min, max);
    export const bigInt = (min?: number, max?: number) => BigInt(int(min, max));
    export const bool = () => [true, false][uint(2)];
    export const boolNull = () => [true, false, null][uint(3)];
    export const nullable = <T>(value: T) => Math.random() > 0.5 ? value : null;

    export const uint8 = () => uint((2 ** 8) - 1);
    export const int8 = () => int(-(2**7), (2**7) - 1);
    export const uint16 = () => uint((2 ** 16) - 1);
    export const int16 = () => int(-(2 ** 15), (2 ** 15) - 1);
    export const uint32 = () => uint((2 ** 32) - 1);
    export const int32 = () => int(-(2 ** 31), (2 ** 31) - 1);
    // according to js number (float64) resolution
    export const uint64 = () => bigInt(0, (2 ** 63) - 1);
    export const int64 = () => bigInt(-(2 ** 62), (2 ** 62) - 1);
    export const float32 = () => number(-(2 ** 23) + 1, (2 ** 23) - 1);
    export const float64 = () => number(-(2 ** 52) + 1, (2 ** 52) - 1);

    export const element = <T>(arr: T[]) => arr[uint(arr.length)];

    export const stringASCII = (length: number) => {
        const arr = new Array<string>(length);
    
        for (let i = 0; i < length; ++i) {
            arr[i] = String.fromCharCode(int(0, 127));
        }
    
        return arr.join('');
    };

    export const stringUTF8 = (length: number) => {
        const arr = new Array<string>(length);
    
        for (let i = 0; i < length; ++i) {
            arr[i] = Math.random() > 0.1 ? String.fromCharCode(int(0, 255)) : '😎';
            // arr[i] = '😎';
        }
    
        return arr.join('');
    };
}

export const generateArray = <T>(count: number, generator: (index?: number) => T) => {
    return new Array(count).fill(1).map((_, index) => generator(index));
};

export const createCycleArrayRunner = <T>(array: T[]) => {
    let i = 0;
    return () => array[(i++) % array.length];
};

export const createCycleIndexRunner = (length: number) => {
    let i = 0;
    return () => (i++) % length;
};

export const sleep = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
