import express from "express";
import APIController from "./controllers/APIController";

export default class MainRouter {
    static build() {
        const router = express.Router();
        const apiController = new APIController();
        router.use('', apiController.router);
        return router;
    }
}