import { Observable } from 'rxjs';
import { 
  Account, 
  AccountSummary, 
  AccountCreationRequest, 
  AccountUpdateRequest 
} from '../../models/account.model';
import { Transaction, TransactionFilter } from '../../models/transaction.model';

export interface IAccountService {
  getAccounts(): Observable<Account[]>;
  getAccountById(id: string): Observable<Account>;
  getAccountsByUserId(userId: string): Observable<Account[]>;
  createAccount(request: AccountCreationRequest): Observable<Account>;
  updateAccount(id: string, request: AccountUpdateRequest): Observable<Account>;
  closeAccount(id: string): Observable<void>;
  getAccountSummary(): Observable<AccountSummary>;
  getAccountTransactions(accountId: string, filter?: TransactionFilter): Observable<Transaction[]>;
  getAccountBalance(id: string): Observable<number>;
}