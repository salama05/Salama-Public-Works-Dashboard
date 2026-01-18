import { Request, Response } from 'express';
import Capital from '../models/Capital';
import Funding from '../models/Funding';

export const getCapitalSummary = async (req: Request, res: Response) => {
    try {
        const capital = await Capital.findOne(); // Assuming single capital record for now
        if (!capital) {
            return res.status(404).json({ message: 'Capital record not found' });
        }

        // Optimize: Use aggregation instead of fetching all documents
        const aggregationResult = await Funding.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalFunding = aggregationResult.length > 0 ? aggregationResult[0].total : 0;

        res.json({
            openingBalance: capital.openingBalance,
            totalFunding,
            totalCapital: capital.openingBalance + totalFunding,
            currency: capital.currency
        });
    } catch (err) {
        res.status(500).json({ message: 'Error calculating capital summary', error: err });
    }
};

export const createOrUpdateCapital = async (req: Request, res: Response) => {
    try {
        let capital = await Capital.findOne();
        if (capital) {
            if (capital.isLocked) {
                return res.status(400).json({ message: 'Capital is locked and cannot be modified' });
            }
            capital.openingBalance = req.body.openingBalance;
            capital.openingDate = req.body.openingDate;
        } else {
            capital = new Capital(req.body);
        }
        await capital.save();
        res.json(capital);
    } catch (err) {
        res.status(500).json({ message: 'Error saving capital', error: err });
    }
};
