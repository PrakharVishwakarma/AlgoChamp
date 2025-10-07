// /packages/db/prisma/seed.ts

import { LANGUAGE_MAPPING } from "@repo/common/language";

import { db } from "../src/index";

async function mainFunc() {
    console.log("Seeding Language in database...");
    for (const language of Object.keys(LANGUAGE_MAPPING)) {
        const lang = LANGUAGE_MAPPING[language]!;
        await db.language.upsert({
            where: {
                id: lang.internal
            },
            update: {},
            create: {
                id: lang.internal,
                name: lang.name,
                judge0Id: lang.judge0
            },
        })
        console.log(`✅ Seeded ${lang.name} in database successfully.`);
    }
    console.log("✅ Seeded all Languages in database successfully.");

}

mainFunc().catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
}).finally(async () => {
    await db.$disconnect();
});
