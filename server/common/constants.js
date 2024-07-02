export const ADMIN = 'ADMIN';
export const USER = 'USER';

export const ROLES = [ADMIN, USER];

export const OTP_MESSAGE = 'Your OTP (One-Time Password) is: ';

export const ACCEPTED = 'accepted';
export const DECLINED = 'declined';
export const PENDING = 'pending';

export const NOTIFICATIONS_STATES = [ACCEPTED, DECLINED, PENDING];

export const UNVALID_USER_MESSAGE = "A user with these details don't exist";

export const TRANSACTION = 'Transaction';
export const RECHARGE = 'Recharge';
export const WITHDRAW = 'Withdraw';
export const BUY_CRYPTO = 'buy-crypto'
export const SELL_CRYPTO = 'sell-crypto';

export const TRANSACTION_TYPES = [TRANSACTION, RECHARGE, WITHDRAW, BUY_CRYPTO, SELL_CRYPTO];

export const BITCOIN = 'bitcoin';
export const ETHEREUM = 'ethereum';
export const TETHER = 'tether';
export const BINANCECOIN = 'binancecoin';
export const SOLANA = 'solana';
export const STACKED_ETHER = 'staked_ether';
export const USD_COIN = 'usd_coin';
export const RIPPLE = 'ripple';

export const CRYPTO_CURRENCIES = [
  BITCOIN,
  ETHEREUM,
  TETHER,
  BINANCECOIN,
  SOLANA,
  STACKED_ETHER,
  USD_COIN,
  RIPPLE,
];

export const CRYPTO_RATES = {
  bitcoin: 30520.4,
  ethereum: 1931.91,
  tether: 1.0,
  binancecoin: 237.8,
  solana: 19.67,
  staked_ether: 1934.09,
  usd_coin: 1.0,
  ripple: 0.49,
};
