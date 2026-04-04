#!/usr/bin/env node

import { generateKey, generateSalt, applyPasswordLayer, encrypt, exportKey } from "@repo/encryption";


// 👆 this shebang line is critical — tells OS to run this with Node

  const handleSubmit = async (content : string, password: string|null) => {
    const ttl = "10000000";
    try {
      const baseKey = await generateKey();
      let keyToUse = baseKey;
      let saltForServer: string | undefined = undefined;

      if (password) {
        const salt = generateSalt();
        keyToUse = await applyPasswordLayer(baseKey, password, salt);
        saltForServer = salt;
      }

      const { ciphertext, iv } = await encrypt(content, keyToUse);
      const exportedKeyBase64 = await exportKey(baseKey);

      const res = await fetch("http:localhost:3000/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciphertext,
          iv,
          ttl: parseInt(ttl, 10),
          passwordHash: saltForServer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create secret");
      }

      const token = data.token;
      const url = `http://localhost:3000/s/${token}#key=${encodeURIComponent(exportedKeyBase64)}`;
      console.log(url)
    } catch (error) {
      console.error(error);
     console.log("you piece of shit cant even code this simple")
    } finally {
      console.log("your try catch block is ended you piece of shit")
    }
  };

console.log("mother fcuker is")
const name = process.argv[2]; // grab CLI argument



if (!name) {
  console.log("Usage: npx @devsharmanpm/greet <name>");
  process.exit(1);
}else{
    handleSubmit(name, null)
}