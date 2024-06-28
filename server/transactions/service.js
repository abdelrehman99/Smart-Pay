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

const getTransactions = async (smartEmail) => {
  const transactions = await Transactions.find({
    $or: [{ to: smartEmail }, { from: smartEmail }],
  }).lean();
  return transactions;
};

export default { sendTransaction, getTransactions };
