import { model, Schema } from 'mongoose';
import nanoid from '../../config/nanoid.js';

const transactionsSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: (value) => {
          return value > 0;
        },
        message: 'Transaction amount must be greater than 0',
      },
    },
  },
  { timestamps: true }
);

const Transactions = model('transactions', transactionsSchema);

export default Transactions;
