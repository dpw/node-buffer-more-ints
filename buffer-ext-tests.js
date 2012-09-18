'use strict';

require('./buffer-ext');

// A simple abbreviation to obtain a buffer from a hex string
function h2b(str) {
    return new Buffer(str, "hex");
}

// Reverse a buffer in-place
function reverse(buf) {
    for (var i = 0, j = buf.length - 1; i < j; i++, j--) {
        var t = buf[i];
        buf[i] = buf[j];
        buf[j] = t;
    }
    return buf;
}

// Discard exceptions due to integers being too large
function tooLargeIsOk(f) {
    try {
        f();
    }
    catch (e) {
        if (!/attempt to read integer too large to be safely held in a JS number:/.test(e.message)) {
            throw e;
        }
    }
}

function readUInt_case(assert, hex, be) {
    var len = hex.length / 2;

    // Straightforward conversion case
    assert.equal(h2b(hex).readUIntBE(len, 0), be);
    assert.equal(reverse(h2b(hex)).readUIntLE(len, 0), be);

    // Reads off the end of the buffer should throw
    assert.throws(function () { h2b(hex).readUIntBE(len, 1); })
    assert.throws(function () { reverse(h2b(hex)).readUIntLE(len, 1); })

    // Node doesn't catch negative offsets
    //assert.throws(function () { h2b(hex).readUIntBE(len, -1); })
    //assert.throws(function () { reverse(h2b(hex)).readUIntLE(len, -1); })

    // Test noAssert reads that stray off the ends of the
    // buffer. These tests can fail due to integers being to
    // big, which is fine.

    tooLargeIsOk(function () {
        assert.equal(h2b(hex).readUIntBE(len, -1, true),
                     h2b("00"+hex).readUIntBE(len, 0));
    });
    tooLargeIsOk(function () {
        assert.equals(reverse(h2b(hex)).readUIntLE(len, 1, true),
                      reverse(h2b("00"+hex)).readUIntLE(len, 1));
    });
    tooLargeIsOk(function () {
        assert.equal(h2b(hex).readUIntBE(len, 1, true),
                     h2b(hex+"00").readUIntBE(len, 1));
    });
    tooLargeIsOk(function () {
        assert.equal(reverse(h2b(hex)).readUIntLE(len, -1, true),
                     reverse(h2b(hex+"00")).readUIntLE(len, 0))
    });
}

module.exports.readUInt = function (assert) {
    readUInt_case(assert, "00", 0x00);
    readUInt_case(assert, "01", 0x01);
    readUInt_case(assert, "ff", 0xff);

    readUInt_case(assert, "0000", 0x0000);
    readUInt_case(assert, "0102", 0x0102);
    readUInt_case(assert, "ffff", 0xffff);

    readUInt_case(assert, "000000", 0x000000);
    readUInt_case(assert, "010203", 0x010203);
    readUInt_case(assert, "ffffff", 0xffffff);

    readUInt_case(assert, "00000000", 0x00000000);
    readUInt_case(assert, "01020304", 0x01020304);
    readUInt_case(assert, "ffffffff", 0xffffffff);

    readUInt_case(assert, "0000000000", 0x0000000000);
    readUInt_case(assert, "0102030405", 0x0102030405);
    readUInt_case(assert, "ffffffffff", 0xffffffffff);

    readUInt_case(assert, "000000000000", 0x000000000000);
    readUInt_case(assert, "010203040506", 0x010203040506);
    readUInt_case(assert, "ffffffffffff", 0xffffffffffff);

    readUInt_case(assert, "00000000000000", 0x00000000000000);
    readUInt_case(assert, "01020304050607", 0x01020304050607);
    readUInt_case(assert, "1fffffffffffff", 0x1fffffffffffff);

    readUInt_case(assert, "0000000000000000", 0x0000000000000000);
    readUInt_case(assert, "0002030405060708", 0x0002030405060708);
    readUInt_case(assert, "001fffffffffffff", 0x001fffffffffffff);

    assert.done();
};

function readInt_case(assert, hex, be) {
    var len = hex.length / 2;

    // Straightforward conversion case
    assert.equal(h2b(hex).readIntBE(len, 0), be);
    assert.equal(reverse(h2b(hex)).readIntLE(len, 0), be);

    // Reads off the end of the buffer should throw
    assert.throws(function () { h2b(hex).readIntBE(len, 1); })
    assert.throws(function () { reverse(h2b(hex)).readIntLE(len, 1); })

    // Node doesn't catch negative offsets
    //assert.throws(function () { h2b(hex).readIntBE(len, -1); })
    //assert.throws(function () { reverse(h2b(hex)).readIntLE(len, -1); })

    // Test noAssert reads that stray off the ends of the
    // buffer. These tests can fail due to integers being to
    // big, which is fine.

    tooLargeIsOk(function () {
        assert.equal(h2b(hex).readIntBE(len, -1, true),
                     h2b("00"+hex).readIntBE(len, 0));
    });
    tooLargeIsOk(function () {
        assert.equals(reverse(h2b(hex)).readIntLE(len, 1, true),
                      reverse(h2b("00"+hex)).readIntLE(len, 1));
    });
    tooLargeIsOk(function () {
        assert.equal(h2b(hex).readIntBE(len, 1, true),
                     h2b(hex+"00").readIntBE(len, 1));
    });
    tooLargeIsOk(function () {
        assert.equal(reverse(h2b(hex)).readIntLE(len, -1, true),
                     reverse(h2b(hex+"00")).readIntLE(len, 0))
    });
}

module.exports.readInt = function (assert) {
    readInt_case(assert, "00", 0x00);
    readInt_case(assert, "01", 0x01);
    readInt_case(assert, "7f", 0x7f);
    readInt_case(assert, "80", -0x80);
    readInt_case(assert, "ff", -0x01);

    readInt_case(assert, "0000", 0x0000);
    readInt_case(assert, "0102", 0x0102);
    readInt_case(assert, "7fff", 0x7fff);
    readInt_case(assert, "8000", -0x8000);
    readInt_case(assert, "ffff", -0x0001);

    readInt_case(assert, "000000", 0x000000);
    readInt_case(assert, "010203", 0x010203);
    readInt_case(assert, "7fffff", 0x7fffff);
    readInt_case(assert, "800000", -0x800000);
    readInt_case(assert, "ffffff", -0x000001);

    readInt_case(assert, "00000000", 0x00000000);
    readInt_case(assert, "01020304", 0x01020304);
    readInt_case(assert, "7fffffff", 0x7fffffff);
    readInt_case(assert, "80000000", -0x80000000);
    readInt_case(assert, "ffffffff", -0x00000001);

    readInt_case(assert, "0000000000", 0x0000000000);
    readInt_case(assert, "0102030405", 0x0102030405);
    readInt_case(assert, "7fffffffff", 0x7fffffffff);
    readInt_case(assert, "8000000000", -0x8000000000);
    readInt_case(assert, "ffffffffff", -0x0000000001);

    readInt_case(assert, "000000000000", 0x000000000000);
    readInt_case(assert, "010203040506", 0x010203040506);
    readInt_case(assert, "7fffffffffff", 0x7fffffffffff);
    readInt_case(assert, "800000000000", -0x800000000000);
    readInt_case(assert, "ffffffffffff", -0x000000000001);

    readInt_case(assert, "00000000000000", 0x00000000000000);
    readInt_case(assert, "01020304050607", 0x01020304050607);
    readInt_case(assert, "1fffffffffffff", 0x1fffffffffffff);
    readInt_case(assert, "e0000000000001", -0x1fffffffffffff);

    readInt_case(assert, "0000000000000000", 0x0000000000000000);
    readInt_case(assert, "0002030405060708", 0x0002030405060708);
    readInt_case(assert, "001fffffffffffff", 0x001fffffffffffff);
    readInt_case(assert, "ffe0000000000001", -0x001fffffffffffff);

    assert.done();
};
