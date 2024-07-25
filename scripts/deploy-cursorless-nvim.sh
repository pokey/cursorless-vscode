#!/usr/bin/env bash
# This script is used to push to the cursorless.nvim github production repo
set -euo pipefail

# Clone current cursorless.nvim main
mkdir -p dist && cd dist
git clone 'https://github.com/hands-free-vim/cursorless.nvim.git' cursorless.nvim-remote
cd -

out_dir=dist/cursorless.nvim-remote

# Delete the old files
cd "$out_dir"
git rm -r README.md lua/ vim/ node/
cd -

#
# Merge the build .js and the static files
#

# copy .lua, .vim dependencies, command-server and other static files
cp -r cursorless.nvim/README.md "$out_dir/"
cp -r cursorless.nvim/lua "$out_dir/"
cp -r cursorless.nvim/vim "$out_dir/"
cp -r cursorless.nvim/node "$out_dir/"

# copy the built .js file
mkdir -p "$out_dir/node/cursorless-neovim/out"
cp packages/cursorless-neovim/package.json "$out_dir/node/cursorless-neovim/"
cp packages/cursorless-neovim/out/index.cjs "$out_dir/node/cursorless-neovim/out/"

# Push to cursorless.nvim
cd "$out_dir"
git add *
git commit -m "Deploy cursorless.nvim"
git push