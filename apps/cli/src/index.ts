#!/usr/bin/env node
// 👆 this shebang line is critical — tells OS to run this with Node

const name = process.argv[2]; // grab CLI argument

if (!name) {
  console.log("Usage: npx @devsharmanpm/greet <name>");
  process.exit(1);
}