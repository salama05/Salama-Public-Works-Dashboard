import mongoose, { Schema, Document } from 'mongoose';

export interface IPiecework extends Document {
    date: Date;
    worker: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    paidAmount: number;
    remainingAmount: number;
    notes?: string;
}

const PieceworkSchema: Schema = new Schema({
    date: { type: Date, required: true },
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IPiecework>('Piecework', PieceworkSchema);
