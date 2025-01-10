import express, { Request, Response, Router, NextFunction } from 'express';
import { authenticate } from "../services/authService";
import { getUserTransactions, getAll, getEth } from "../services/transactionService";
import AuthHelpers from "../utils/authHelpers";
import loggedIn from "../middleware/loggedIn";
import globalTry from "../middleware/globalTry";

export default class LimeController {
    router: Router;

    constructor() {
        this.router = express.Router();
        this.attachEndpoints();
    }

    attachEndpoints() {
        this.router.post('/authenticate', (req, res, next) => globalTry(this.authenticate, req, res, next));
        this.router.get('/eth/:rlphex?', (req, res, next) => globalTry(this.getEth, req, res, next));
        this.router.get('/all', (req, res, next) => globalTry(this.getAll, req, res, next));
        this.router.get('/my', loggedIn, (req, res, next) => globalTry(this.getMy, req, res, next));
    }

    async authenticate(req: Request, res: Response) {
        const { username, password } = req.body;
        const token = await authenticate(username, password);
        res.status(200).json(token);
    }

    async getEth(req: Request, res: Response) {
        const user = AuthHelpers.getUser(req);
        const data = await getEth(req, user);
        res.status(200).json({ transactions: data });
    }

    async getAll(req: Request, res: Response) {
        const data = await getAll();
        res.status(200).json({ transactions: data });
    }

    async getMy(req: Request, res: Response) {
        const user = AuthHelpers.getUser(req);
        if (!user) throw new Error("User not found");
        const data = await getUserTransactions(user.id);
        res.status(200).json({ transactions: data });
    }
}
