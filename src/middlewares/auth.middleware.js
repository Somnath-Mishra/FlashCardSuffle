import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {conf} from '../conf/conf.js'
import { PrismaClient } from '@prisma/client';

const prisma=new PrismaClient();


export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(accessToken, conf.accessTokenSecret);

        const user=await prisma.user.findUnique({
            where:{
                id:decodedToken?.id
            },
            select:{
                id:true,
                email:true,
                firstName:true,
                lastName:true
            }
        })


        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});