import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

export const createController = <T extends Document>(model: Model<T>, populateFields?: string | string[]) => {
    return {
        getAll: async (req: Request, res: Response) => {
            try {
                let query = model.find().sort({ createdAt: -1 });
                if (populateFields) {
                    query = query.populate(populateFields);
                }
                const items = await query;
                res.json(items);
            } catch (err) {
                res.status(500).json({ message: 'Error fetching data', error: err });
            }
        },

        getById: async (req: Request, res: Response) => {
            try {
                let query = model.findById(req.params.id);
                if (populateFields) {
                    query = query.populate(populateFields);
                }
                const item = await query;
                if (!item) return res.status(404).json({ message: 'Item not found' });
                res.json(item);
            } catch (err) {
                res.status(500).json({ message: 'Error fetching item', error: err });
            }
        },

        create: async (req: Request, res: Response) => {
            try {
                const newItem = new model(req.body);
                const savedItem = await newItem.save();
                if (populateFields) {
                    await savedItem.populate(populateFields);
                }
                res.status(201).json(savedItem);
            } catch (err) {
                res.status(400).json({ message: 'Error creating item', error: err });
            }
        },

        update: async (req: Request, res: Response) => {
            try {
                let query = model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (populateFields) {
                    query = query.populate(populateFields);
                }
                const updatedItem = await query;
                if (!updatedItem) return res.status(404).json({ message: 'Item not found' });
                res.json(updatedItem);
            } catch (err) {
                res.status(400).json({ message: 'Error updating item', error: err });
            }
        },

        delete: async (req: Request, res: Response) => {
            try {
                const deletedItem = await model.findByIdAndDelete(req.params.id);
                if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
                res.json({ message: 'Item deleted successfully' });
            } catch (err) {
                res.status(500).json({ message: 'Error deleting item', error: err });
            }
        }
    };
};
