import mongoose, { Schema, Document } from 'mongoose';

export interface ICapital extends Document {
    openingBalance: number;
    currency: string;
    openingDate: Date;
    isLocked: boolean;
}

const CapitalSchema: Schema = new Schema({
    openingBalance: { type: Number, required: true },
    currency: { type: String, default: 'DZD' },
    openingDate: { type: Date, required: true },
    isLocked: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICapital>('Capital', CapitalSchema);
