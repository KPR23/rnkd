import "dotenv/config";
import * as schema from "./schema";
import { db } from ".";

async function main() {
	console.log("Seeding database...");

	try {
		const newUsers = [
			{
				name: "John Doe",
				age: 28,
				email: "john.doe@example.com",
			},
			{
				name: "Jane Smith",
				age: 34,
				email: "jane.smith@example.com",
			},
		];

		for (const user of newUsers) {
			await db
				.insert(schema.usersTable)
				.values(user)
				.onConflictDoNothing({ target: schema.usersTable.email });
		}

		console.log("Database seeded successfully!");
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

main();
