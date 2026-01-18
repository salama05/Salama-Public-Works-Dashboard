import mongoose, { Schema, Document } from 'mongoose';

export interface IFunding extends Document {
    amount: number;
    date: Date;
    paymentMethod: 'cash' | 'bank' | 'check';
    reference?: string;
    notes?: string;
}

const FundingSchema: Schema = new Schema({
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'check'], required: true },
    reference: { type: String },
    notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IFunding>('Funding', FundingSchema);
