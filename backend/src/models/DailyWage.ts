import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyWage extends Document {
    date: Date;
    worker: mongoose.Types.ObjectId;
    days: number;
    dailyRate: number;
    totalPrice: number;
    paidAmount: number;
    remainingAmount: number;
    notes?: string;
}

const DailyWageSchema: Schema = new Schema({
    date: { type: Date, required: true },
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    days: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IDailyWage>('DailyWage', DailyWageSchema);
