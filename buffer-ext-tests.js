'use strict';

require('./buffer-ext');

// A simple abbreviation to obtain a buffer from a hex string
function h2b(str) {
    return new Buffer(str, "hex");
}

function test_readUInt(assert, hex, be, le) {
    var len = hex.length / 2;
    le = le || be;

    // Straightforward conversion case
    assert.equal(h2b(hex).readUIntBE(len, 0), be);
    assert.equal(h2b(hex).readUIntLE(len, 0), le);

    // Reads off the end of the buffer should throw
    assert.throws(function () { h2b(hex).readUIntBE(len, 1); })
    assert.throws(function () { h2b(hex).readUIntLE(len, 1); })

    // Node's Buffer doesn't catch negative offsets
    //assert.throws(function () { h2b(hex).readUIntBE(len, -1); })
    //assert.throws(function () { h2b(hex).readUIntLE(len, -1); })

    // Test noAssert reads that stray off the ends of the buffer
    assert.equal(h2b(hex).readUIntBE(len, -1, true),
                 h2b("00"+hex).readUIntBE(len, 0));
    assert.equal(h2b(hex).readUIntLE(len, 1, true),
                 h2b(hex+"00").readUIntLE(len, 1));

    var expect = null;
    try {
        // The resulting integer may be too big, in which case
        // skip this test
        expect = h2b(hex+"00").readUIntBE(len, 1);
    } catch (e) {};
    if (expect != null) {
        assert.equal(h2b(hex).readUIntBE(len, 1, true), expect);
    }

    expect = null;
    try {
        // The resulting integer may be too big, in which case
        // skip this test
        expect = h2b("00"+hex).readUIntLE(len, 0);
    } catch (e) {};
    if (expect != null) {
        assert.equal(h2b(hex).readUIntLE(len, -1, true), expect);
    }
}

module.exports.readUInt = function (assert) {
    test_readUInt(assert, "00", 0x00);
    test_readUInt(assert, "01", 0x01);
    test_readUInt(assert, "ff", 0xff);

    test_readUInt(assert, "0000", 0x0000);
    test_readUInt(assert, "0102", 0x0102, 0x0201);
    test_readUInt(assert, "ffff", 0xffff);

    test_readUInt(assert, "000000", 0x000000);
    test_readUInt(assert, "010203", 0x010203, 0x030201);
    test_readUInt(assert, "ffffff", 0xffffff);

    test_readUInt(assert, "00000000", 0x00000000);
    test_readUInt(assert, "01020304", 0x01020304, 0x04030201);
    test_readUInt(assert, "ffffffff", 0xffffffff);

    test_readUInt(assert, "0000000000", 0x0000000000);
    test_readUInt(assert, "0102030405", 0x0102030405, 0x0504030201);
    test_readUInt(assert, "ffffffffff", 0xffffffffff);

    test_readUInt(assert, "000000000000", 0x000000000000);
    test_readUInt(assert, "010203040506", 0x010203040506, 0x060504030201);
    test_readUInt(assert, "ffffffffffff", 0xffffffffffff);

    test_readUInt(assert, "00000000000000", 0x00000000000000);
    test_readUInt(assert, "01020304050607", 0x01020304050607, 0x07060504030201);
    test_readUInt(assert, "1fffffffffff1f", 0x1fffffffffff1f);

    test_readUInt(assert, "0000000000000000", 0x0000000000000000);
    test_readUInt(assert, "0001020304050600", 0x0001020304050600, 0x0006050403020100);
    test_readUInt(assert, "001fffffffff1f00", 0x001fffffffff1f00);

    assert.done();
};
