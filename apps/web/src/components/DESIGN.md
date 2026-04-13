# Design System Strategy: SecretTunnel Digital Identity

## 1. Overview & Creative North Star: "The Terminal Vault"

This design system is built for the modern architect of digital secrets. The "Creative North Star" is **The Terminal Vault**—a concept that marries the raw, functional efficiency of a developer's CLI with the prestige and impenetrable nature of high-end Swiss banking.

To move beyond the "standard SaaS" look, this system utilizes **intentional asymmetry** and **tonal depth**. We bypass traditional grid-heavy layouts in favor of an editorial approach where white space (negative space) is used as a functional tool to focus the user’s eye on what matters most: the secret. By layering surfaces rather than boxing them in, we create a UI that feels like an integrated environment rather than a collection of disparate widgets.

---

## 2. Colors: Depth Through Tonal Layering

Our palette is rooted in the absence of light, using **Deep Slate (#131314)** as the canvas. This allows the **Amber/Gold (#F6BE39)** accents to feel like high-value data illuminated in a dark room.

### The "No-Line" Rule
Traditional UI relies on 1px borders to separate content. In this system, **1px solid borders for sectioning are prohibited.** Boundaries must be defined solely through:
- **Background Shifts:** Placing a `surface-container-low` section against a `surface` background.
- **Tonal Transitions:** Using the natural contrast between `surface-container-lowest` and `surface-container-highest`.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-matte materials. 
- **Surface (Base):** The foundation of the application.
- **Surface-Container-Low:** For secondary navigation or sidebar elements.
- **Surface-Container-Highest:** Reserved for the "Primary Secret Area" or high-priority modals.
Nesting these tiers (e.g., a `surface-container-highest` card inside a `surface-container-low` section) creates a "natural lift" that feels architectural rather than programmed.

### The Glass & Gradient Rule
For floating elements like tooltips or dropdown menus, use **Glassmorphism**.
- **Values:** `surface-variant` with a 60% opacity and a `20px` backdrop-blur.
- **CTA Soul:** Main actions (Primary Buttons) should not be flat hex codes. Apply a subtle linear gradient from `primary` (#F6BE39) to `primary-container` (#D4A017) at a 135-degree angle to add a metallic, premium sheen.

---

## 3. Typography: Technical Authority

The typography system is a conversation between human-centric UI and machine-readable data.

- **Display & Headlines (Space Grotesk):** This typeface provides a technical yet sophisticated edge. Use `display-lg` for impactful landing states. High-contrast sizing (e.g., a large `headline-lg` paired with a small `label-md`) creates the signature editorial look.
- **Body & Titles (Inter):** Inter handles the heavy lifting. Its neutrality ensures that UI instructions remain invisible, allowing the content to lead.
- **Code & Secret Areas (JetBrains Mono):** For the actual secrets, logs, and Webhook URLs. This communicates "System Integrity."

---

## 4. Elevation & Depth: Tonal Sophistication

We reject the "drop shadow" of 2015. Elevation is achieved through light and atmospheric layering.

- **The Layering Principle:** Use the `surface-container` tiers to stack information. A "Viewed" status tag should live in a container slightly darker than the row it sits on, creating a recessed, "etched" look.
- **Ambient Shadows:** For floating modals, use a "Shadow Tint." Instead of black, use a 4% opacity shadow based on the `primary` token. 
    - *Example:* `box-shadow: 0 20px 40px rgba(246, 190, 57, 0.04);`
- **The "Ghost Border" Fallback:** If a boundary is functionally required (e.g., an input field), use the `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** High-gloss gradient (`primary` to `primary-container`). Sharp corners (`rounded-sm`: 2px-4px) to maintain the "Cyber-Secure" aesthetic.
- **Secondary:** Ghost style. No background, `outline-variant` (20% opacity) border. 
- **Tertiary:** Text-only in `primary` color, used for low-priority actions like "Cancel."

### Input Fields (Secret Area)
Avoid the "boxed" look. Use `surface-container-highest` with a `surface-variant` bottom-border (2px). When focused, the bottom border transitions to `primary` gold. The font must be JetBrains Mono.

### Chips & Status Indicators
Status chips (e.g., "Active," "Expired") should use high-saturation text on low-saturation backgrounds.
- **Active:** `tertiary` text on `tertiary-container` (at 10% opacity).
- **Expired:** `error` text on `error-container` (at 10% opacity).

### Cards & Tables
**Strict Rule:** Forbid divider lines. Use vertical white space (32px or 48px) to separate the "Your Secrets" header from the table. The table rows should use alternating `surface` and `surface-container-low` backgrounds to denote separation without "grid-prison" lines.

### Signature Component: The "Tunnel" Progress
For encryption processes, use a 2px tall progress bar using the `primary` color, featuring a subtle `box-shadow` glow of the same color to mimic a laser cutting through the dark.

---

## 6. Do’s and Don’ts

### Do
- **Do** use `//` (the yellow slashes) as a recurring motif in UI headers or bullet points to reinforce brand identity.
- **Do** lean into extreme contrast. Use `on-background` white for headers and `on-surface-variant` gray for secondary descriptions.
- **Do** allow elements to overlap slightly (e.g., a modal overlapping a table edge) to create depth.

### Don't
- **Don't** use large border-radii. Keep everything between `4px` and `8px`. Anything more feels too "consumer-soft" and loses the technical edge.
- **Don't** use standard "Success Green." Stick to the system’s Gold/Amber and Slate for a bespoke, branded feel.
- **Don't** clutter. If a piece of information isn't vital to the developer's immediate task (Encrypting or Sharing), hide it behind a hover state or secondary layer.