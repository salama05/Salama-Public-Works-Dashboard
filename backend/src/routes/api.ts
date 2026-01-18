import { Router } from 'express';
import { createController } from '../controllers/genericController';
import { getCapitalSummary, createOrUpdateCapital } from '../controllers/capitalController';
import { loginUser, registerUser } from '../controllers/authController';

import Funding from '../models/Funding';
import Supplier from '../models/Supplier';
import Purchase from '../models/Purchase';
import Worker from '../models/Worker';
import WorkerPayment from '../models/WorkerPayment';
import Piecework from '../models/Piecework';
import DailyWage from '../models/DailyWage';
import Expense from '../models/Expense';

const router = Router();
import { getDashboardSummary } from '../controllers/dashboardController';

// Dashboard Routes
router.get('/dashboard/summary', getDashboardSummary);

// Auth Routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Capital Custom Routes
router.get('/capital/summary', getCapitalSummary);
router.post('/capital', createOrUpdateCapital);

// Generic Routes
const resources = [
    { path: 'funding', model: Funding },
    { path: 'suppliers', model: Supplier },
    { path: 'purchases', model: Purchase, populate: 'supplier' },
    { path: 'workers', model: Worker },
    { path: 'worker-payments', model: WorkerPayment, populate: 'worker' },
    { path: 'piecework', model: Piecework, populate: 'worker' },
    { path: 'dailywages', model: DailyWage, populate: 'worker' },
    { path: 'expenses', model: Expense }
];

resources.forEach(({ path, model, populate }) => {
    const controller = createController(model as any, populate);
    router.get(`/${path}`, controller.getAll);
    router.get(`/${path}/:id`, controller.getById);
    router.post(`/${path}`, controller.create);
    router.put(`/${path}/:id`, controller.update);
    router.delete(`/${path}/:id`, controller.delete);
});

export default router;
