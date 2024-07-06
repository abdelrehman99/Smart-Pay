import Transactions from './model.js';
import Users from '../users/model.js';
import { BUY_CRYPTO, CRYPTO_RATES, RECHARGE } from '../common/constants.js';

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

const rechargeOrDepositTransaction = async (
  user,
  type,
  cardId,
  amount,
  cardIdx
) => {
  const email = user.smartEmail;
  const transaction = await Transactions.create({
    from: email,
    to: email,
    type,
    amount,
    cardId,
  });

  if (type == RECHARGE) {
    (user.cards[cardIdx].balance -= amount), (user.balance += amount);
  } else {
    (user.cards[cardIdx].balance += amount), (user.balance -= amount);
  }

  await Users.findByIdAndUpdate(user._id, {
    $set: {
      cards: user.cards,
      balance: user.balance,
    },
  });

  return transaction;
};

const buyOrSellCryptoTransaction = async (user, type, crypto, cryptoAmount) => {
  const email = user.smartEmail;
  const amount = CRYPTO_RATES[crypto] * cryptoAmount;

  const transaction = await Transactions.create({
    from: email,
    to: email,
    type,
    amount,
    cryptoAmount,
    crypto
  });

  if (!user.cryptoBalance) {
    user.cryptoBalance = { [crypto]: 0 };
  } else if (!user.cryptoBalance[crypto]) user.cryptoBalance[crypto] = 0;

  console.log(user.cryptoBalance[crypto]);

  if (type == BUY_CRYPTO) {
    (user.balance -= amount), (user.cryptoBalance[crypto] += cryptoAmount);
  } else {
    (user.balance += amount), (user.cryptoBalance[crypto] -= cryptoAmount);
  }

  await Users.findByIdAndUpdate(user._id, {
    $set: {
      cryptoBalance: user.cryptoBalance,
      balance: user.balance,
    },
  });

  return transaction;
};

const getTransactions = async (smartEmail) => {
  const transactions = await Transactions.find({
    $or: [{ to: smartEmail }, { from: smartEmail }],
  }).lean();
  return transactions;
};

const getAdminTransactions = async () => {
  const transactions = await Transactions.find({}).lean();
  return transactions;
};

export default {
  sendTransaction,
  getTransactions,
  rechargeOrDepositTransaction,
  buyOrSellCryptoTransaction,
  getAdminTransactions,
};
