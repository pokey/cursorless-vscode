#!/usr/bin/env bash

esbuild \
    ./src/extension.ts \
    --outfile=./out/talon.js \
    --platform=neutral \
    --main-fields=main,module \
    --format=esm \
    --conditions=cursorless:bundler \
    --bundle \
    --sourcemap \
    --external:talon \
    $@


if [ $? -ne 0 ]; then
    exit 1
fi


# Talon javascript files needs to start with an import from Talon before any other code
TALON_IMPORT='import { Context as DefaultContext } from "talon";'
sed -i "1s/^/${TALON_IMPORT}\n\n/" out/talon.js