import { ensureJsExt } from '../lib/scene/sceneMethods.js';

// Mock the code and config arrays if needed
// import { code, config } from 'common-js-file-extensions';

describe('ensureJsExt', () => {
    it('returns filename unchanged if it has a known JS extension', () => {
        expect(ensureJsExt('foo.js')).toBe('foo.js');
        expect(ensureJsExt('bar.jsx')).toBe('bar.jsx');
        expect(ensureJsExt('baz.mjs')).toBe('baz.mjs');
        expect(ensureJsExt('qux.cjs')).toBe('qux.cjs');
    });

    it('adds .js if no known extension', () => {
        expect(ensureJsExt('foo')).toBe('foo.js');
        expect(ensureJsExt('bar.txt')).toBe('bar.txt.js');
        expect(ensureJsExt('baz.unknown')).toBe('baz.unknown.js');
    });

    it('is case-insensitive for extensions', () => {
        expect(ensureJsExt('foo.JS')).toBe('foo.JS');
        expect(ensureJsExt('bar.JSX')).toBe('bar.JSX');
        expect(ensureJsExt('baz.MJS')).toBe('baz.MJS');
    });
});
