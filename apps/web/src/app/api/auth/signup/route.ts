import { NextResponse } from "next/server";
import { z } from "zod";

import { createEmailVerificationToken } from "@/lib/email-verification";
import { sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { createCredentialsUser } from "@/lib/user-store";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = signupSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid signup data." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(result.data.password);
    const user = await createCredentialsUser({
      name: result.data.name,
      email: result.data.email,
      passwordHash,
    });
    const { token } = await createEmailVerificationToken(user.id);

    if (!user.email) {
      throw new Error("Unable to send verification email.");
    }

    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        message: "Check your email for a verification link.",
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create user.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
