#!/usr/bin/env node

import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { handlePush } from "./push";
import { handlePull } from "./pull";
import { exitWithError, getContent, parsePullArgs, parsePushArgs, printUsage, promptForOptionalPassword } from "./utils";

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = argv[0];
  const rl = createInterface({ input, output });

  try {
    if (command === "push") {
      const args = parsePushArgs(argv.slice(1));
      const content = await getContent(args);

      let password = args.password;
      if (!password) {
        password = await promptForOptionalPassword(rl);
      }

      await handlePush(content, password, args.ttl, args.webhookUrl);
      return;
    }

    if (command === "pull") {
      const args = parsePullArgs(argv.slice(1));

      if (!args.reference) {
        exitWithError("Missing token or URL for pull command");
      }

      await handlePull(args.reference, args.key, args.password, args.outputPath, rl);
      return;
    }

    printUsage();
    exitWithError(`Unknown command: ${command}. Use push or pull.`);
  } finally {
    rl.close();
  }
}

main();
