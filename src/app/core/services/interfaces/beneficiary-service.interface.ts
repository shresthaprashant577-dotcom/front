import { Observable } from 'rxjs';
import { 
  Beneficiary, 
  BeneficiaryCreationRequest, 
  TransferToBeneficiaryRequest 
} from '../../models/beneficiary.model';
import { Transaction } from '../../models/transaction.model';

export interface IBeneficiaryService {
  getBeneficiaries(): Observable<Beneficiary[]>;
  getBeneficiaryById(id: string): Observable<Beneficiary>;
  createBeneficiary(request: BeneficiaryCreationRequest): Observable<Beneficiary>;
  updateBeneficiary(id: string, beneficiary: Partial<Beneficiary>): Observable<Beneficiary>;
  deleteBeneficiary(id: string): Observable<void>;
  transferToBeneficiary(request: TransferToBeneficiaryRequest): Observable<Transaction>;
  validateBeneficiary(accountNumber: string, bankCode: string): Observable<boolean>;
}