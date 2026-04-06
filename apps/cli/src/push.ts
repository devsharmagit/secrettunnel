import { applyPasswordLayer, encrypt, exportKey, generateKey, generateSalt } from "@repo/encryption";
import axios from "axios";
import ora from "ora";
import { API_URL, SHARE_BASE_URL, STEP_TIMEOUT_MS } from "./config";
import { getAxiosErrorMessage } from "./utils";


export async function handlePush(content: string, password: string | null, ttl: number) {
  const spinner = ora("Encrypting secret...").start();

  try {
    const baseKey = await generateKey();
    let keyToUse = baseKey;
    let saltForServer: string | undefined = undefined;

    if (password) {
      spinner.text = "Applying password protection...";
      const salt = generateSalt();
      keyToUse = await applyPasswordLayer(baseKey, password, salt);
      saltForServer = salt;
    }

    spinner.text = "Encrypting secret...";
    const { ciphertext, iv } = await encrypt(content, keyToUse);
    const exportedKeyBase64 = await exportKey(baseKey);

    spinner.text = "Sending to server...";

    const res = await axios.post(
      API_URL,
      {
        ciphertext,
        iv,
        ttl,
        passwordHash: saltForServer,
      },
      { timeout: STEP_TIMEOUT_MS },
    );

    const token = (res.data as { token?: string })?.token;
    if (!token) {
      throw new Error("Server response missing token");
    }

    const url = `${SHARE_BASE_URL}/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;

    spinner.succeed("Secret created successfully!");
    console.log("🔗 Share this link:\n");
    console.log(url);
    console.log("\n");
  } catch (error) {
    spinner.fail("Failed to create secret");
    console.error("\n❌ Error:", getAxiosErrorMessage(error));
    process.exit(1);
  }
}