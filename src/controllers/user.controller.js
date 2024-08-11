import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken, hashPassword, isPasswordCorrect } from "../middlewares/database.middleware.js";
import { PrismaClient } from "@prisma/client";

export const prisma=new PrismaClient();

export const registerUser = asyncHandler(async (req, res) => {
    const { email, firstName, lastName, password, confirmPassword,role } = req.body;
    if (
        [email, firstName, lastName, password, confirmPassword,role].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password should be same");
    }

    const exitedUser = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    if (exitedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const hashedPassword=await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            email,
            firstName,
            lastName,
            password:hashedPassword,
            role:role
        },
    });

    const createdUser = await prisma.user.findFirst({
        where: {
            id: user.id,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    });

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        // const user = await User.findById(userId);
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        const accessToken = await generateAccessToken(user);
        const refreshToken = await generateRefreshToken(user);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: refreshToken,
            },
        });


        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    if (!email) {
        throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password must match");
    }

    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    if (!user) {
        throw new ApiError(404, "User does not exits");
    }
    const isProvidedPasswordCorrect = await isPasswordCorrect(password,user.password);
    if (!isProvidedPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user.id
    );

    const loggedInUser = await prisma.user.findFirst({
        where: {
            id: user.id,
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            refreshToken: null,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken || null;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        conf.REFRESH_TOKEN_SECRET
    );
    const user = await prisma.user.findUnique({
        where: {
            id: decodedToken?.id,
        },
    });
    if (!user) {
        throw new ApiError(404, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired");
    }
    const options = {
        httpOnly: true,
        secure: true,
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user.id
    );
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                "Access token refreshed successfully"
            )
        );
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id;

    const user=await prisma.user.findUnique({
        where:{
            id:userId
        }
    });

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All password fields are required");
    }
    const isProvidedPasswordCorrect = await isPasswordCorrect(oldPassword, user.password)
    if (!isProvidedPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password must match");
    }

    const hashedPassword=await hashPassword(newPassword);

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedPassword,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});