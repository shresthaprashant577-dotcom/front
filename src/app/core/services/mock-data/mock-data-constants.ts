export const MOCK_LOGINS = [
  { username: 'admin', password: 'Admin123!', role: 'Admin' as const },
  { username: 'manager1', password: 'Manager123!', role: 'Manager' as const },
  { username: 'teller1', password: 'Teller123!', role: 'Teller' as const },
  { username: 'customer1', password: 'Customer123!', role: 'Customer' as const },
  { username: 'john.doe', password: 'Password123!', role: 'Customer' as const },
];

export const BANK_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export const TRANSACTION_CATEGORIES = [
  { value: 'ATM', label: 'ATM Transaction' },
  { value: 'POS', label: 'Point of Sale' },
  { value: 'Online', label: 'Online Banking' },
  { value: 'Branch', label: 'Branch Transaction' },
  { value: 'Check', label: 'Check Transaction' },
  { value: 'AutoPay', label: 'Automatic Payment' },
  { value: 'Manual', label: 'Manual Entry' },
];

export const ACCOUNT_TYPES = [
  { value: 'Checking', label: 'Checking Account', icon: 'account_balance' },
  { value: 'Savings', label: 'Savings Account', icon: 'savings' },
  { value: 'Business', label: 'Business Account', icon: 'business' },
  { value: 'FixedDeposit', label: 'Fixed Deposit', icon: 'lock_clock' },
  { value: 'Loan', label: 'Loan Account', icon: 'monetization_on' },
  { value: 'CreditCard', label: 'Credit Card', icon: 'credit_card' },
];

export const USER_ROLES = [
  { value: 'Admin', label: 'Administrator', level: 4 },
  { value: 'Manager', label: 'Branch Manager', level: 3 },
  { value: 'Teller', label: 'Bank Teller', level: 2 },
  { value: 'Customer', label: 'Customer', level: 1 },
];

export const BRANCH_SERVICES = [
  { value: 'PersonalBanking', label: 'Personal Banking', icon: 'person' },
  { value: 'BusinessBanking', label: 'Business Banking', icon: 'business' },
  { value: 'Loans', label: 'Loans', icon: 'monetization_on' },
  { value: 'Investments', label: 'Investments', icon: 'trending_up' },
  { value: 'WealthManagement', label: 'Wealth Management', icon: 'attach_money' },
  { value: 'International', label: 'International Banking', icon: 'public' },
];