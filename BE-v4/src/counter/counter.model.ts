import mongoose, { Schema } from "mongoose";

interface ICounter {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: {
    type: String,
    required: true,
  },
  sequence: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model<ICounter>("Counter", counterSchema);

export default Counter;