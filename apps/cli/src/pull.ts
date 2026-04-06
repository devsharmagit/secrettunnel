import { Interface } from "readline/promises";
import { confirmOverwrite, decryptSecret, fetchSecret, getAxiosErrorMessage, parseSecretReference, promptForRequiredPassword } from "./utils";
import ora from "ora";
import { SecretPayload } from "./type";
import { existsSync, writeFileSync } from "fs";

export async function handlePull(
  reference: string,
  keyOverride: string | null,
  initialPassword: string | null,
  outputPath: string | null,
  rl: Interface,
) {
  try {
    const { token, key } = parseSecretReference(reference, keyOverride);

    const fetchSpinner = ora("Fetching secret...").start();
    let encryptedData: SecretPayload;
    try {
      encryptedData = await fetchSecret(token);
      fetchSpinner.succeed("Secret fetched");
    } catch (error) {
      fetchSpinner.fail("Failed to fetch secret");
      throw error;
    }

    let plaintext: string | null = null;

    if (encryptedData.passwordHash) {
      let currentPassword = initialPassword;
      const maxAttempts = initialPassword ? 1 : 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (!currentPassword) {
          currentPassword = await promptForRequiredPassword(rl);
        }

        const decryptSpinner = ora("Decrypting secret...").start();
        try {
          plaintext = await decryptSecret(encryptedData, key, currentPassword);
          decryptSpinner.succeed("Secret decrypted");
          break;
        } catch {
          decryptSpinner.fail("Failed to decrypt secret");
          if (attempt < maxAttempts && !initialPassword) {
            console.error("Incorrect password. Please try again.");
            currentPassword = null;
            continue;
          }

          throw new Error("Failed to decrypt secret. Incorrect password or corrupted key.");
        }
      }
    } else {
      const decryptSpinner = ora("Decrypting secret...").start();
      try {
        plaintext = await decryptSecret(encryptedData, key);
        decryptSpinner.succeed("Secret decrypted");
      } catch (error) {
        decryptSpinner.fail("Failed to decrypt secret");
        throw error;
      }
    }

    if (plaintext === null) {
      throw new Error("Failed to decrypt secret");
    }

    if (outputPath && outputPath !== "-") {
      if (existsSync(outputPath)) {
        const shouldOverwrite = await confirmOverwrite(rl, outputPath);
        if (!shouldOverwrite) {
          console.log("\nℹ️ Aborted. Existing file was not modified.\n");
          return;
        }
      }

      writeFileSync(outputPath, plaintext, "utf-8");
      console.log(`\n✅ Secret written to ${outputPath}\n`);
      return;
    }

    console.log("\n✅ Secret decrypted successfully!\n");
    console.log(plaintext);
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}