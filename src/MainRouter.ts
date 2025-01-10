import express from "express";
import LimeController from "./controllers/LimeController";

export default class MainRouter {
    static build() {
        const router = express.Router();
        const limeController = new LimeController();
        router.use('', limeController.router);
        return router;
    }
}