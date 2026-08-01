import { Router } from 'express';
import healthRoutes from './health.routes.js';
import chatRoutes from './chat.routes.js';
import { sessionRouter } from './session.routes.js';

const apiRouter = Router();

// Mount API v1 routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/', chatRoutes);
apiRouter.use('/sessions', sessionRouter);

export default apiRouter;
