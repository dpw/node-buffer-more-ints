'use strict';

require('./buffer-more-ints');

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

// Fill a buffer with distinctive data
function scrub(buf) {
    var pos = 0;
    var written;
    while ((written = buf.write("deadbeef", pos, 4, "hex")) == 4) {
        pos += written;
    }
    return buf;
}

// Discard exceptions due to integers being too large
function tooLargeIsOk(f) {
    try {
        f();
    }
    catch (e) {
        if (!/attempt to read integer too large to be safely held in a JS number/.test(e.message)) {
            throw e;
        }
    }
}

function uint_case(assert, hex, val) {
    var len = hex.length / 2;

    // Straightforward read cases
    assert.equal(h2b(hex).readUIntBE(len, 0), val);
    assert.equal(reverse(h2b(hex)).readUIntLE(len, 0), val);

    // Test straightforward writes and noAssert writes off the ends of
    // the buffer
    var buf = scrub(new Buffer(len));
    buf.writeUIntBE(len, val, 0);
    assert.equal(buf.readUIntBE(len, 0), val);

    var buf2 = scrub(new Buffer(len));
    buf2.writeUIntBE(len, val, -1, true);
    assert.equal(buf2.slice(0, len-1).toString("hex"),
                 buf.slice(1, len).toString("hex"));
    scrub(buf2);
    buf2.writeUIntBE(len, val, 1, true);
    assert.equal(buf2.slice(1, len).toString("hex"),
                 buf.slice(0, len-1).toString("hex"));

    scrub(buf);
    buf.writeUIntLE(len, val, 0);
    assert.equal(buf.readUIntLE(len, 0), val);

    scrub(buf2);
    buf2.writeUIntLE(len, val, -1, true);
    assert.equal(buf2.slice(0, len-1).toString("hex"),
                 buf.slice(1, len).toString("hex"));
    scrub(buf2);
    buf2.writeUIntLE(len, val, 1, true);
    assert.equal(buf2.slice(1, len).toString("hex"),
                 buf.slice(0, len-1).toString("hex"));

    // Accessess off the end of the buffer should throw. Node doesn't
    // catch negative offsets.
    assert.throws(function () { h2b(hex).readUIntBE(len, 1); })
    assert.throws(function () { reverse(h2b(hex)).readUIntLE(len, 1); })
    assert.throws(function () { buf.writeUIntBE(len, val, 1); });
    assert.throws(function () { buf.writeUIntLE(len, val, 1); });

    // Test noAssert reads that stray off the ends of the
    // buffer. These tests can fail due to integers being to big,
    // which is fine.
    tooLargeIsOk(function () {
        var expect = h2b("00"+hex).readUIntBE(len, 0);
        assert.equal(h2b(hex).readUIntBE(len, -1, true), expect);
        assert.equals(reverse(h2b(hex)).readUIntLE(len, 1, true), expect);
    });
    tooLargeIsOk(function () {
        var expect = h2b(hex+"00").readUIntBE(len, 1);
        assert.equal(h2b(hex).readUIntBE(len, 1, true), expect);
        assert.equal(reverse(h2b(hex)).readUIntLE(len, -1, true), expect);
    });
}

module.exports.uint = function (assert) {
    uint_case(assert, "00", 0x00);
    uint_case(assert, "01", 0x01);
    uint_case(assert, "ff", 0xff);

    uint_case(assert, "0000", 0x0000);
    uint_case(assert, "0102", 0x0102);
    uint_case(assert, "ffff", 0xffff);

    uint_case(assert, "000000", 0x000000);
    uint_case(assert, "010203", 0x010203);
    uint_case(assert, "ffffff", 0xffffff);

    uint_case(assert, "00000000", 0x00000000);
    uint_case(assert, "01020304", 0x01020304);
    uint_case(assert, "ffffffff", 0xffffffff);

    uint_case(assert, "0000000000", 0x0000000000);
    uint_case(assert, "0102030405", 0x0102030405);
    uint_case(assert, "ffffffffff", 0xffffffffff);

    uint_case(assert, "000000000000", 0x000000000000);
    uint_case(assert, "010203040506", 0x010203040506);
    uint_case(assert, "ffffffffffff", 0xffffffffffff);

    uint_case(assert, "00000000000000", 0x00000000000000);
    uint_case(assert, "01020304050607", 0x01020304050607);
    uint_case(assert, "1fffffffffffff", 0x1fffffffffffff);

    uint_case(assert, "0000000000000000", 0x0000000000000000);
    uint_case(assert, "0002030405060708", 0x0002030405060708);
    uint_case(assert, "001fffffffffffff", 0x001fffffffffffff);

    assert.done();
};

function int_case(assert, hex, val) {
    var len = hex.length / 2;

    // Straightforward read cases
    assert.equal(h2b(hex).readIntBE(len, 0), val);
    assert.equal(reverse(h2b(hex)).readIntLE(len, 0), val);

    // Test straightforward writes and noAssert writes off the ends of
    // the buffer
    var buf = scrub(new Buffer(len));
    buf.writeIntBE(len, val, 0);
    assert.equal(buf.readIntBE(len, 0), val);

    var buf2 = scrub(new Buffer(len));
    buf2.writeIntBE(len, val, -1, true);
    assert.equal(buf2.slice(0, len-1).toString("hex"),
                 buf.slice(1, len).toString("hex"));
    scrub(buf2);
    buf2.writeIntBE(len, val, 1, true);
    assert.equal(buf2.slice(1, len).toString("hex"),
                 buf.slice(0, len-1).toString("hex"));

    scrub(buf);
    buf.writeIntLE(len, val, 0);
    assert.equal(buf.readIntLE(len, 0), val);

    scrub(buf2);
    buf2.writeIntLE(len, val, -1, true);
    assert.equal(buf2.slice(0, len-1).toString("hex"),
                 buf.slice(1, len).toString("hex"));
    scrub(buf2);
    buf2.writeIntLE(len, val, 1, true);
    assert.equal(buf2.slice(1, len).toString("hex"),
                 buf.slice(0, len-1).toString("hex"));

    // Accesses off the end of the buffer should throw. Node doesn't
    // catch negative offsets.
    assert.throws(function () { h2b(hex).readIntBE(len, 1); })
    assert.throws(function () { reverse(h2b(hex)).readIntLE(len, 1); })
    assert.throws(function () { buf.writeIntBE(len, val, 1); });
    assert.throws(function () { buf.writeIntLE(len, val, 1); });

    // Test noAssert reads that stray off the ends of the
    // buffer. These tests can fail due to integers being to
    // big, which is fine.
    tooLargeIsOk(function () {
        var expect = h2b("00"+hex).readIntBE(len, 0);
        assert.equal(h2b(hex).readIntBE(len, -1, true), expect);
        assert.equals(reverse(h2b(hex)).readIntLE(len, 1, true), expect);
    });
    tooLargeIsOk(function () {
        var expect = h2b(hex+"00").readIntBE(len, 1);
        assert.equal(h2b(hex).readIntBE(len, 1, true), expect);
        assert.equal(reverse(h2b(hex)).readIntLE(len, -1, true), expect);
    });
}

module.exports.int = function (assert) {
    int_case(assert, "00", 0x00);
    int_case(assert, "01", 0x01);
    int_case(assert, "7f", 0x7f);
    int_case(assert, "80", -0x80);
    int_case(assert, "ff", -0x01);

    int_case(assert, "0000", 0x0000);
    int_case(assert, "0102", 0x0102);
    int_case(assert, "7fff", 0x7fff);
    int_case(assert, "8000", -0x8000);
    int_case(assert, "ffff", -0x0001);

    int_case(assert, "000000", 0x000000);
    int_case(assert, "010203", 0x010203);
    int_case(assert, "7fffff", 0x7fffff);
    int_case(assert, "800000", -0x800000);
    int_case(assert, "ffffff", -0x000001);

    int_case(assert, "00000000", 0x00000000);
    int_case(assert, "01020304", 0x01020304);
    int_case(assert, "7fffffff", 0x7fffffff);
    int_case(assert, "80000000", -0x80000000);
    int_case(assert, "ffffffff", -0x00000001);

    int_case(assert, "0000000000", 0x0000000000);
    int_case(assert, "0102030405", 0x0102030405);
    int_case(assert, "7fffffffff", 0x7fffffffff);
    int_case(assert, "8000000000", -0x8000000000);
    int_case(assert, "ffffffffff", -0x0000000001);

    int_case(assert, "000000000000", 0x000000000000);
    int_case(assert, "010203040506", 0x010203040506);
    int_case(assert, "7fffffffffff", 0x7fffffffffff);
    int_case(assert, "800000000000", -0x800000000000);
    int_case(assert, "ffffffffffff", -0x000000000001);

    int_case(assert, "00000000000000", 0x00000000000000);
    int_case(assert, "01020304050607", 0x01020304050607);
    int_case(assert, "1fffffffffffff", 0x1fffffffffffff);
    int_case(assert, "e0000000000001", -0x1fffffffffffff);
    int_case(assert, "ffffffffffffff", -0x00000000000001);

    int_case(assert, "0000000000000000", 0x0000000000000000);
    int_case(assert, "0002030405060708", 0x0002030405060708);
    int_case(assert, "001fffffffffffff", 0x001fffffffffffff);
    int_case(assert, "ffe0000000000001", -0x001fffffffffffff);
    int_case(assert, "ffffffffffffffff", -0x0000000000000001);

    assert.done();
};
