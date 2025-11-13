import dotenv from "dotenv";
dotenv.config();


import { hash } from "bcryptjs";
import prompts from "prompts";

import { prisma } from '../lib/prisma'

async function main() {
  console.log("=== Prisma User Seeder ===");

  let addMore = true;

  while (addMore) {
    const response = await prompts([
      {
        type: "text",
        name: "name",
        message: "Enter user name:",
      },
      {
        type: "text",
        name: "email",
        message: "Enter user email:",
      },
      {
        type: "password",
        name: "password",
        message: "Enter password:",
      },
      {
        type: "text",
        name: "companyName",
        message: "Enter company name (optional):",
      },
      {
        type: "confirm",
        name: "addAnother",
        message: "Add another user?",
        initial: false,
      },
    ]);

    const hashedPassword = await hash(response.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: response.email },
      update: {},
      create: {
        name: response.name,
        email: response.email,
        password: hashedPassword,
        companyName: response.companyName || null,
      },
    });

    console.log("User created / verified:", user);

    addMore = response.addAnother;
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
