import { Request, Response } from 'express';
import Capital from '../models/Capital';
import Funding from '../models/Funding';
import Expense from '../models/Expense';
import Purchase from '../models/Purchase';
import Supplier from '../models/Supplier';
import Worker from '../models/Worker';
import Piecework from '../models/Piecework';
import DailyWage from '../models/DailyWage';

export const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        // 1. Capital & Funding
        const capitalEntry = await Capital.findOne();
        const openingBalance = capitalEntry ? capitalEntry.openingBalance : 0;

        const fundings = await Funding.find();
        const totalFunding = fundings.reduce((sum, item) => sum + item.amount, 0);
        const totalCapital = openingBalance + totalFunding;

        // 2. Expenses
        const expenses = await Expense.find();
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

        // 3. Purchases
        const purchases = await Purchase.find();
        const totalPurchases = purchases.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalPaidPurchases = purchases.reduce((sum, item) => sum + item.paidAmount, 0);
        const totalRemainingPurchases = purchases.reduce((sum, item) => sum + item.remainingAmount, 0);

        // 4. Labor Costs (Piecework + DailyWages)
        const pieceworks = await Piecework.find();
        const totalPiecework = pieceworks.reduce((sum, item) => sum + item.totalPrice, 0);

        const dailyWages = await DailyWage.find();
        const totalDailyWages = dailyWages.reduce((sum, item) => sum + item.totalPrice, 0);

        const totalLaborCost = totalPiecework + totalDailyWages;

        // 5. Counts
        const suppliersCount = await Supplier.countDocuments();
        const workersCount = await Worker.countDocuments();

        // 6. Balance Calculation (Approximate: Capital - Expenses - Paid Purchases - Paid Labor)
        // Note: Ideally we should track "Paid Labor", let's sum paid amounts for labor too
        const paidPiecework = pieceworks.reduce((sum, item) => sum + item.paidAmount, 0);
        const paidDailyWages = dailyWages.reduce((sum, item) => sum + item.paidAmount, 0);
        const totalPaidLabor = paidPiecework + paidDailyWages;

        const currentBalance = totalCapital - totalExpenses - totalPaidPurchases - totalPaidLabor;

        res.json({
            capital: {
                total: totalCapital,
                openingBalance,
                funding: totalFunding
            },
            expenses: totalExpenses,
            purchases: {
                total: totalPurchases,
                paid: totalPaidPurchases,
                remaining: totalRemainingPurchases // Debts to suppliers
            },
            labor: {
                total: totalLaborCost,
                paid: totalPaidLabor,
                remaining: totalPiecework + totalDailyWages - totalPaidLabor // Debts to workers
            },
            counts: {
                suppliers: suppliersCount,
                workers: workersCount
            },
            currentBalance
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard summary', error });
    }
};
