import { model, Schema } from 'mongoose';
import nanoid from '../../config/nanoid.js';
import { NOTIFICATIONS_STATES, PENDING } from '../common/constants.js';

const notificationsSchema = new Schema(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    smartEmail: {
      type: String,
      default: () => nanoid(),
    },
    state: {
      type: String,
      default: PENDING,
      enum: NOTIFICATIONS_STATES,
    },
    transaction: {
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
  },
  { timestamps: true }
);

const Notifications = model('notifications', notificationsSchema);

export default Notifications;
