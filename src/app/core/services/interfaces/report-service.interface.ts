import { Observable } from 'rxjs';
import { Report, ReportRequest } from '../../models/report.model';

export interface IReportService {
  getReports(): Observable<Report[]>;
  getReportById(id: string): Observable<Report>;
  generateReport(request: ReportRequest): Observable<Report>;
  downloadReport(id: string): Observable<Blob>;
  getReportTypes(): Observable<Array<{ value: string; label: string }>>;
  getReportFormats(): Observable<Array<{ value: string; label: string }>>;
}