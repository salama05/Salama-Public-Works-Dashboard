import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
    date: Date;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    supplier: mongoose.Types.ObjectId;
    paidAmount: number;
    remainingAmount: number;
}

const PurchaseSchema: Schema = new Schema({
    date: { type: Date, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }, // Should be calculated, but stored for ease
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
