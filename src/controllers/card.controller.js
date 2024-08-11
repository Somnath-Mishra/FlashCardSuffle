import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { PrismaClient } from '@prisma/client';

const prisma=new PrismaClient();

export const createCard = asyncHandler(async (req, res) => {
    const { question, answer } = req.body;
    if (!question.trim() || !answer.trim()) {
        throw new ApiError(400, "All fields are required");
    }
    const isPublic = false;
    const user = req?.user;

    if (user.role === "ADMIN") {
        const admin = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
        });

        if (admin) {
            isPublic = true;
        }
    }

    const newCard = await prisma.card.create({
        data: {
            question,
            answer,
            isPublic,
            ownerId: req.user.id,
        },
    });

    if (!newCard) {
        throw new ApiError(500, "Something went wrong while creating card");
    }

    res.status(201).json(
        new ApiResponse(201, newCard, "Card created successfully")
    );
});

export const updateCard = asyncHandler(async (req, res) => {
    const { id, question, answer } = req.body;
    if (!id || !question?.trim() || !answer?.trim()) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedCard = await prisma.card.update({
        where: {
            id,
        },
        data: {
            question,
            answer,
        },
    });

    if (!updateCard) {
        throw new ApiError(500, "Something went wrong while updating card");
    }

    res.status(200).json(
        new ApiResponse(200, updatedCard, "Card updated successfully")
    );
});

export const deleteCard = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        throw new ApiError(400, "Id is required");
    }

    const card = await prisma.card.findUnique({ where: { id } });

    if(card.ownerId!==req.user.id){
        throw new ApiError(403,"You are not authorized to delete this card");
    }

    const deletedCard = await prisma.card.delete({
        where: {
            id,
        },
    });

    if (!deletedCard) {
        throw new ApiError(500, "Something went wrong while deleting card");
    }

    res.status(200).json(new ApiResponse(200, {}, "Card deleted successfully"));
});

export const getAllPublicCard = asyncHandler(async (req, res) => {
    const allCards = await prisma.card.findMany({
        where: {
            isPublic: true,
        },
    });
    if(!allCards){
        throw new ApiError(500, "Something went wrong while fetching cards");
    }

    res
    .status(200)
    .json(new ApiResponse(200, allCards, "Cards fetched successfully"));
});

export const getMyCard = asyncHandler(async (req, res) => {
    const allCards = await prisma.card.findMany({
        where: {
            ownerId: req.user.id,
        },
    });
    if(!allCards){
        throw new ApiError(500, "Something went wrong while fetching cards");
    }

    res
    .status(200)
    .json(new ApiResponse(200, allCards, "Cards fetched successfully"));
});

