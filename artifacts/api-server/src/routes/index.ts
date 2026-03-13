import { Router, type IRouter } from "express";
import healthRouter from "./health";
import qaiRouter from "./qai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/qai", qaiRouter);

export default router;
