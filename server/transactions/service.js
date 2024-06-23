import Transactions from './model.js';
import Users from '../users/model.js';

const sendTransaction = async (senderEmail, receiverEmail, amount) => {
  await Users.findOneAndUpdate(
    { smartEmail: senderEmail },
    { $inc: { balance: -amount } }
  );
  await Users.findOneAndUpdate(
    { smartEmail: receiverEmail },
    { $inc: { balance: amount } }
  );

  const transaction = await Transactions.create({
    from: senderEmail,
    to: receiverEmail,
    amount,
  });

  return transaction;
};

export default { sendTransaction };
