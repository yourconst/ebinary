export class Cache<T = any> {
    private _cache: T[] = [];
    private _index = -1;

    clear() {
        this._cache.length = 0;
        this._index = -1;
    }

    getPosition() {
        return this._index + 1;
    }

    setPosition(i: number) {
        this._index = i - 1;
    }

    add(value: T) {
        this._cache.push(value);
    }

    get() {
        return this._cache[++this._index];
    }
}
