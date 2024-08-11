import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app=express();

app.use(cors({
    origin:true,
    credentials:true,
}))

app.use(express.json({
    limit:"64kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"64kb"
}))

app.use(express.static("public"));

app.use(cookieParser());

//Routes import
import userRouter from './routes/user.routes.js'
import cardRouter from './routes/card.routes.js'


//Routes import
app.use('/api/v1/user',userRouter);
app.use('/api/v1/card', cardRouter);


export {app};