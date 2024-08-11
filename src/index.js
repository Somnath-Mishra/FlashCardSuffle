import dotenv from 'dotenv';
import {connectDB} from './db/index.js';
import { app } from './app.js';
import {conf} from "./conf/conf.js";

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.on('error',(error)=>{
        console.log("ERROR: ",error);
        throw error;
    });

    app.on('SIGINT',async()=>{
        await prisma.$disconnect();
        process.exit(0);
    })

    app.on('SIGTERM',async()=>{
        await prisma.$disconnect();
        process.exit(0);
    });

    const PORT=conf.serverPort||9000;
    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error)=>{
    console.log("MySQL connection failed!!!", error);
})