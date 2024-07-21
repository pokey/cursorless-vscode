#!/usr/bin/env bash

if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "quickjs tests are only supported on Linux"
    exit 0
fi

esbuild \
    --outfile=testOut/talon \
    --platform=neutral \
    --format=esm \
    src/test/talonMock.ts

esbuild \
    --outfile=testOut/quickjsTest.js \
    --platform=neutral \
    --format=esm \
    src/test/quickjsTest.ts

cp -r out/talon.js testOut/cursorless.mjs

cd testOut

# curl -o qjs.zip https://bellard.org/quickjs/binary_releases/quickjs-win-x86_64-2024-01-13.zip
curl -o qjs.zip https://bellard.org/quickjs/binary_releases/quickjs-linux-x86_64-2024-01-13.zip

unzip qjs.zip

./qjs -I cursorless.mjs quickjsTest.js
