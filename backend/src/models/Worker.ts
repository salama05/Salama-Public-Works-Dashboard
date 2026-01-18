import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
    name: string;
    profession: string;
    address: string;
    phone: string;
}

const WorkerSchema: Schema = new Schema({
    name: { type: String, required: true },
    profession: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
}, { timestamps: true });

export default mongoose.model<IWorker>('Worker', WorkerSchema);
