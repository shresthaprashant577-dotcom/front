import { Observable } from 'rxjs';
import { 
  Transaction, 
  TransactionFilter, 
  TransferRequest, 
  DepositRequest, 
  WithdrawalRequest 
} from '../../models/transaction.model';

export interface ITransactionService {
  getTransactions(filter?: TransactionFilter): Observable<Transaction[]>;
  getTransactionById(id: string): Observable<Transaction>;
  transfer(request: TransferRequest): Observable<Transaction>;
  deposit(request: DepositRequest): Observable<Transaction>;
  withdraw(request: WithdrawalRequest): Observable<Transaction>;
  getTransactionStats(): Observable<{
    totalTransactions: number;
    totalAmount: number;
    todayTransactions: number;
    todayAmount: number;
  }>;
  reverseTransaction(transactionId: string): Observable<Transaction>;
}