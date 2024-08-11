import { PrismaClient } from "@prisma/client";

const prisma=new PrismaClient();

// Connect to the database
export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Failed to connect to the database", error);
        process.exit(1); // Exit the process with a failure code
    }
}
