import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkerPayment extends Document {
    date: Date;
    worker: mongoose.Types.ObjectId;
    amount: number;
    notes?: string;
}

const WorkerPaymentSchema: Schema = new Schema({
    date: { type: Date, required: true },
    worker: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IWorkerPayment>('WorkerPayment', WorkerPaymentSchema);
