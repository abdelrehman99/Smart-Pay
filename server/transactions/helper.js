import { RECHARGE, BUY_CRYPTO, CRYPTO_RATES } from '../common/constants.js';

export const IsSufficientFunds = (userBalance, cardBalance, type, amount) => {
  return type == RECHARGE ? cardBalance >= amount : userBalance >= amount;
};

export const IsSufficientCrypto = (
  balance,
  crypto,
  cryptoBalance,
  type,
  cryptoAmount
) =>
{
  return type == BUY_CRYPTO
    ? cryptoAmount * CRYPTO_RATES[crypto] <= balance
    : cryptoAmount <= cryptoBalance;
};
