import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eventsRouter from "./events";
import registrationsRouter from "./registrations";
import usersRouter from "./users";
import mediaRouter from "./media";
import analyticsRouter from "./analytics";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use(registrationsRouter);
router.use(usersRouter);
router.use(mediaRouter);
router.use(analyticsRouter);
router.use(dashboardRouter);

export default router;
