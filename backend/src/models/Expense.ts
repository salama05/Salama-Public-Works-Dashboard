import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    date: Date;
    description: string;
    amount: number;
    notes?: string;
}

const ExpenseSchema: Schema = new Schema({
    date: { type: Date, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
