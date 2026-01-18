import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
    name: string;
    address: string;
    phone: string;
}

const SupplierSchema: Schema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
}, { timestamps: true });

export default mongoose.model<ISupplier>('Supplier', SupplierSchema);
