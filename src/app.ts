import express from 'express';
import dotenv from 'dotenv';
import MainRouter from './MainRouter';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
dotenv.config();

const SERVER_TIMEOUT = Number(600000);
if (isNaN(SERVER_TIMEOUT)) throw new Error("Invalid SERVER_TIMEOUT value");

const PORT = Number(process.env.API_PORT);
if (isNaN(PORT)) throw new Error("Invalid API_PORT value");

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({ credentials: true, origin: '*', optionsSuccessStatus: 200 }));
// Timeout middleware
app.use((req, res, next) => {
    res.setTimeout(SERVER_TIMEOUT, () => {
        console.error('Request has timed out');
        res.status(408).send('Request Timeout');
    });
    next();
});
app.use('/lime', MainRouter.build());
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    res.status(500).send(error.message);
});
app.listen(PORT, () => {
    console.info(`Server running on port ${PORT}`);
});
