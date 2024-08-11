import bcrypt from "bcrypt";
import { conf } from "../conf/conf.js";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function isPasswordCorrect(plainPassword, hashedPassword) {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function createOrUpdateUser(user) {
    try {
        const hashedPassword = await hashPassword(user.password);
        return await prisma.user.upsert({
            where: { email: user.email },
            update: {
                ...user,
                password: hashedPassword,
            },
            create: {
                ...user,
                password: hashedPassword,
            },
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function generateAccessToken(user) {
    try {
        return await jwt.sign(
            {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            conf.accessTokenSecret,
            { expiresIn: conf.accessTokenExpiry }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function generateRefreshToken(user) {
    try {
        return await jwt.sign(
            {
                id: user.id,
            },
            conf.refreshTokenSecret,
            { expiresIn: conf.refreshTokenExpiry }
        );
    } catch (error) {
        console.log(error);
        throw error;
    }
}
