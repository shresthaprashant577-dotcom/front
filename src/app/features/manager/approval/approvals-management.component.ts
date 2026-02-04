import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/layouts/dashboard-layout/dashboard-layout.component';

interface ApprovalRequest {
  id: string;
  requestId: string;
  type: 'transaction' | 'account' | 'user' | 'branch' | 'loan' | 'override' | 'compliance';
  subType: string;
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  requesterBranch: string;
  submittedAt: Date;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'escalated' | 'reviewed';
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  decision?: 'approve' | 'reject' | 'escalate' | 'request_info';
  decisionNotes?: string;
  decisionAt?: Date;
  escalationLevel: number;
  maxEscalationLevel: number;
  attachments: ApprovalAttachment[];
  relatedDocuments: RelatedDocument[];
  riskLevel: 'low' | 'medium' | 'high';
  complianceCheck: boolean;
  amount?: number;
  currency?: string;
  impactAnalysis?: string;
  slaStatus: 'on_time' | 'at_risk' | 'breached';
}

interface ApprovalAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
}

interface RelatedDocument {
  id: string;
  type: string;
  reference: string;
  description: string;
  date: Date;
}

interface ApprovalWorkflow {
  id: string;
  requestId: string;
  steps: WorkflowStep[];
  currentStep: number;
  completed: boolean;
}

interface WorkflowStep {
  step: number;
  name: string;
  approverRole: string;
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  actionAt?: Date;
  actionNotes?: string;
  slaHours: number;
}

interface ApprovalStats {
  totalPending: number;
  approvedToday: number;
  rejectedToday: number;
  avgResponseTime: number;
  slaCompliance: number;
  byType: { type: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  overdue: number;
}

@Component({
  selector: 'app-approvals-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './approvals-management.component.html',
})
export class ApprovalsManagementComponent implements OnInit {
  getTypeIcon(type: string): string {
    switch(type) {
      case 'transaction':
        return '💰';
      case 'account':
        return '🏦';
      case 'user':
        return '👤';
      case 'branch':
        return '🏢';
      case 'loan':
        return '📄';
      case 'override':
        return '⚙️';
      case 'compliance':
        return '🛡️';
      default:
        return '📋';
    }
  }
  Math = Math;
  
  // Approval requests data
  approvalRequests: ApprovalRequest[] = [];
  filteredRequests: ApprovalRequest[] = [];
  
  // Workflows
  workflows: ApprovalWorkflow[] = [];
  
  // Current request details
  selectedRequest: ApprovalRequest | null = null;
  showRequestDetails: boolean = false;
  requestWorkflow: ApprovalWorkflow | null = null;
  
  // Decision making
  showDecisionModal: boolean = false;
  decisionType: 'approve' | 'reject' | 'escalate' | 'request_info' = 'approve';
  decisionNotes: string = '';
  
  // Filters
  searchTerm: string = '';
  selectedType: string = 'all';
  selectedStatus: string = 'pending';
  selectedPriority: string = 'all';
  selectedRisk: string = 'all';
  selectedSla: string = 'all';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Sorting
  sortColumn: string = 'submittedAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Statistics
  stats: ApprovalStats = {
    totalPending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgResponseTime: 0,
    slaCompliance: 0,
    byType: [],
    byPriority: [],
    overdue: 0
  };
  

    getAttachmentIcon(type: string): string {
    switch(type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '🖼️';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
      case 'rar':
        return '🗂️';
      default:
        return '📎';
    }
  }
  
   getDocumentIcon(type: string): string {
    switch(type.toLowerCase()) {
      case 'customer profile':
        return '👤';
      case 'account statement':
        return '🏦';
      case 'compliance check':
        return '🛡️';
      case 'hr record':
        return '📋';
      case 'credit report':
        return '📊';
      case 'fraud alert':
        return '🚨';
      case 'branch policy':
        return '📜';
      default:
        return '📄';
    }
  }
  // Current user (manager)
  currentUser = {
    id: 'M001',
    name: 'Robert Brown',
    role: 'manager',
    branch: 'Downtown Branch'
  };
  
  // Approval types
  approvalTypes = [
    { value: 'all', label: 'All Types', color: 'bg-gray-100 text-gray-800' },
    { value: 'transaction', label: 'Transaction', color: 'bg-blue-100 text-blue-800' },
    { value: 'account', label: 'Account', color: 'bg-green-100 text-green-800' },
    { value: 'user', label: 'User', color: 'bg-purple-100 text-purple-800' },
    { value: 'branch', label: 'Branch', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'loan', label: 'Loan', color: 'bg-red-100 text-red-800' },
    { value: 'override', label: 'Override', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'compliance', label: 'Compliance', color: 'bg-pink-100 text-pink-800' }
  ];
  
  // Statuses
  statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'escalated', label: 'Escalated', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];
  
  // Priorities
  priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];
  
  // Risk levels
  riskLevels = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Risk', color: 'bg-red-100 text-red-800' }
  ];
  
  // SLA statuses
  slaStatuses = [
    { value: 'all', label: 'All SLA Status' },
    { value: 'on_time', label: 'On Time', color: 'bg-green-100 text-green-800' },
    { value: 'at_risk', label: 'At Risk', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'breached', label: 'Breached', color: 'bg-red-100 text-red-800' }
  ];
  
  // Decision options
  decisionOptions = [
    { value: 'approve', label: 'Approve', color: 'bg-green-100 text-green-800', icon: '✅' },
    { value: 'reject', label: 'Reject', color: 'bg-red-100 text-red-800', icon: '❌' },
    { value: 'escalate', label: 'Escalate', icon: '⬆️' },
    { value: 'request_info', label: 'Request Info', icon: '❓' }
  ];
  
  // Transaction subtypes
  transactionSubTypes = [
    'Large Deposit',
    'Large Withdrawal',
    'International Transfer',
    'Cash Transaction Over Limit',
    'Suspicious Activity',
    'Account Overdraft'
  ];
  
  // Account subtypes
  accountSubTypes = [
    'Account Opening',
    'Account Closure',
    'Limit Increase',
    'Status Change',
    'KYC Update'
  ];
  
  ngOnInit(): void {
    this.loadApprovalRequests();
    this.loadWorkflows();
    this.calculateStatistics();
  }
  
  loadApprovalRequests(): void {
    // Mock approval requests data
    this.approvalRequests = [
      {
        id: '1',
        requestId: 'APR20240115001',
        type: 'transaction',
        subType: 'Large Deposit',
        title: 'Large Cash Deposit - $45,000',
        description: 'Customer deposit exceeding daily limit requires manager approval',
        requesterId: 'T001',
        requesterName: 'Sarah Johnson',
        requesterRole: 'teller',
        requesterBranch: 'Downtown Branch',
        submittedAt: new Date('2024-01-15T09:30:00'),
        dueDate: new Date('2024-01-15T17:00:00'),
        priority: 'high',
        status: 'pending',
        assignedTo: 'M001',
        assignedToName: 'Robert Brown',
        assignedAt: new Date('2024-01-15T09:35:00'),
        escalationLevel: 1,
        maxEscalationLevel: 3,
        attachments: [
          {
            id: '1',
            name: 'deposit_slip.pdf',
            type: 'pdf',
            size: '2.4 MB',
            uploadedAt: new Date('2024-01-15T09:30:00'),
            uploadedBy: 'Sarah Johnson',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '1',
            type: 'Customer Profile',
            reference: 'CUST001234',
            description: 'John Smith - VIP Customer',
            date: new Date('2023-05-15')
          }
        ],
        riskLevel: 'medium',
        complianceCheck: true,
        amount: 45000,
        currency: 'USD',
        impactAnalysis: 'Customer is VIP, regular large deposits from business',
        slaStatus: 'on_time'
      },
      {
        id: '2',
        requestId: 'APR20240115002',
        type: 'account',
        subType: 'Limit Increase',
        title: 'Account Daily Limit Increase',
        description: 'Request to increase daily withdrawal limit from $5,000 to $15,000',
        requesterId: 'T002',
        requesterName: 'Mike Davis',
        requesterRole: 'teller',
        requesterBranch: 'Westside Branch',
        submittedAt: new Date('2024-01-15T10:15:00'),
        dueDate: new Date('2024-01-16T10:15:00'),
        priority: 'medium',
        status: 'pending',
        assignedTo: 'M001',
        assignedToName: 'Robert Brown',
        assignedAt: new Date('2024-01-15T10:20:00'),
        escalationLevel: 1,
        maxEscalationLevel: 2,
        attachments: [
          {
            id: '2',
            name: 'limit_request_form.pdf',
            type: 'pdf',
            size: '1.8 MB',
            uploadedAt: new Date('2024-01-15T10:15:00'),
            uploadedBy: 'Mike Davis',
            url: '#'
          },
          {
            id: '3',
            name: 'income_verification.jpg',
            type: 'image',
            size: '850 KB',
            uploadedAt: new Date('2024-01-15T10:15:00'),
            uploadedBy: 'Mike Davis',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '2',
            type: 'Account Statement',
            reference: 'AC00123456',
            description: 'Last 6 months statement',
            date: new Date('2024-01-01')
          }
        ],
        riskLevel: 'low',
        complianceCheck: true,
        amount: 15000,
        currency: 'USD',
        impactAnalysis: 'Customer has consistent high balance',
        slaStatus: 'on_time'
      },
      {
        id: '3',
        requestId: 'APR20240115003',
        type: 'transaction',
        subType: 'International Transfer',
        title: 'International Wire Transfer - €25,000',
        description: 'Large international transfer to Germany requires compliance check',
        requesterId: 'T003',
        requesterName: 'Anna Williams',
        requesterRole: 'teller',
        requesterBranch: 'North Branch',
        submittedAt: new Date('2024-01-15T11:30:00'),
        dueDate: new Date('2024-01-15T16:00:00'),
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'M001',
        assignedToName: 'Robert Brown',
        assignedAt: new Date('2024-01-15T11:35:00'),
        escalationLevel: 1,
        maxEscalationLevel: 3,
        attachments: [
          {
            id: '4',
            name: 'wire_transfer_form.pdf',
            type: 'pdf',
            size: '3.2 MB',
            uploadedAt: new Date('2024-01-15T11:30:00'),
            uploadedBy: 'Anna Williams',
            url: '#'
          },
          {
            id: '5',
            name: 'beneficiary_docs.zip',
            type: 'archive',
            size: '4.5 MB',
            uploadedAt: new Date('2024-01-15T11:30:00'),
            uploadedBy: 'Anna Williams',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '3',
            type: 'Compliance Check',
            reference: 'COMP20240115',
            description: 'AML screening completed',
            date: new Date('2024-01-15')
          }
        ],
        riskLevel: 'high',
        complianceCheck: true,
        amount: 25000,
        currency: 'EUR',
        impactAnalysis: 'High-risk jurisdiction, requires enhanced due diligence',
        slaStatus: 'at_risk'
      },
      {
        id: '4',
        requestId: 'APR20240115004',
        type: 'user',
        subType: 'Access Request',
        title: 'System Access Request - New Teller',
        description: 'New teller requires access to transaction system and cash management',
        requesterId: 'M002',
        requesterName: 'Lisa Anderson',
        requesterRole: 'manager',
        requesterBranch: 'East Branch',
        submittedAt: new Date('2024-01-15T13:00:00'),
        dueDate: new Date('2024-01-16T13:00:00'),
        priority: 'medium',
        status: 'pending',
        escalationLevel: 1,
        maxEscalationLevel: 2,
        attachments: [
          {
            id: '6',
            name: 'employee_form.pdf',
            type: 'pdf',
            size: '1.2 MB',
            uploadedAt: new Date('2024-01-15T13:00:00'),
            uploadedBy: 'Lisa Anderson',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '4',
            type: 'HR Record',
            reference: 'EMP010',
            description: 'Employee onboarding complete',
            date: new Date('2024-01-14')
          }
        ],
        riskLevel: 'low',
        complianceCheck: false,
        impactAnalysis: 'Standard access for new employee',
        slaStatus: 'on_time'
      },
      {
        id: '5',
        requestId: 'APR20240114001',
        type: 'loan',
        subType: 'Personal Loan',
        title: 'Personal Loan Approval - $20,000',
        description: 'Personal loan application requires final manager approval',
        requesterId: 'LO001',
        requesterName: 'David Wilson',
        requesterRole: 'loan_officer',
        requesterBranch: 'Downtown Branch',
        submittedAt: new Date('2024-01-14T14:30:00'),
        dueDate: new Date('2024-01-15T14:30:00'),
        priority: 'high',
        status: 'reviewed',
        reviewedBy: 'Robert Brown',
        reviewedAt: new Date('2024-01-15T10:00:00'),
        reviewNotes: 'Credit check completed, income verified',
        escalationLevel: 2,
        maxEscalationLevel: 3,
        attachments: [
          {
            id: '7',
            name: 'loan_application.pdf',
            type: 'pdf',
            size: '5.1 MB',
            uploadedAt: new Date('2024-01-14T14:30:00'),
            uploadedBy: 'David Wilson',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '5',
            type: 'Credit Report',
            reference: 'CREDIT001',
            description: 'Credit score: 750',
            date: new Date('2024-01-13')
          }
        ],
        riskLevel: 'medium',
        complianceCheck: true,
        amount: 20000,
        currency: 'USD',
        impactAnalysis: 'Good credit history, stable employment',
        slaStatus: 'breached'
      },
      {
        id: '6',
        requestId: 'APR20240115005',
        type: 'override',
        subType: 'System Override',
        title: 'System Override - Account Frozen',
        description: 'Customer account frozen due to suspicious activity, requires override to release funds',
        requesterId: 'T001',
        requesterName: 'Sarah Johnson',
        requesterRole: 'teller',
        requesterBranch: 'Downtown Branch',
        submittedAt: new Date('2024-01-15T15:45:00'),
        dueDate: new Date('2024-01-15T18:00:00'),
        priority: 'urgent',
        status: 'pending',
        assignedTo: 'M001',
        assignedToName: 'Robert Brown',
        assignedAt: new Date('2024-01-15T15:50:00'),
        escalationLevel: 1,
        maxEscalationLevel: 3,
        attachments: [
          {
            id: '8',
            name: 'fraud_report.pdf',
            type: 'pdf',
            size: '2.8 MB',
            uploadedAt: new Date('2024-01-15T15:45:00'),
            uploadedBy: 'Sarah Johnson',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '6',
            type: 'Fraud Alert',
            reference: 'FRAUD001',
            description: 'False positive identified',
            date: new Date('2024-01-15')
          }
        ],
        riskLevel: 'high',
        complianceCheck: true,
        amount: 5000,
        currency: 'USD',
        impactAnalysis: 'Customer stranded overseas, needs emergency funds',
        slaStatus: 'at_risk'
      },
      {
        id: '7',
        requestId: 'APR20240113001',
        type: 'compliance',
        subType: 'Regulatory Report',
        title: 'Monthly Compliance Report Submission',
        description: 'Monthly regulatory compliance report requires manager review and sign-off',
        requesterId: 'CO001',
        requesterName: 'Emma Martinez',
        requesterRole: 'compliance',
        requesterBranch: 'Head Office',
        submittedAt: new Date('2024-01-13T09:00:00'),
        dueDate: new Date('2024-01-15T17:00:00'),
        priority: 'high',
        status: 'approved',
        reviewedBy: 'Robert Brown',
        reviewedAt: new Date('2024-01-14T14:00:00'),
        decision: 'approve',
        decisionNotes: 'All compliance requirements met',
        decisionAt: new Date('2024-01-14T14:30:00'),
        escalationLevel: 1,
        maxEscalationLevel: 2,
        attachments: [
          {
            id: '9',
            name: 'compliance_report.pdf',
            type: 'pdf',
            size: '12.4 MB',
            uploadedAt: new Date('2024-01-13T09:00:00'),
            uploadedBy: 'Emma Martinez',
            url: '#'
          }
        ],
        relatedDocuments: [],
        riskLevel: 'medium',
        complianceCheck: true,
        impactAnalysis: 'Regulatory requirement, mandatory submission',
        slaStatus: 'on_time'
      },
      {
        id: '8',
        requestId: 'APR20240112001',
        type: 'branch',
        subType: 'Cash Order',
        title: 'Large Cash Order - $150,000',
        description: 'Branch cash order exceeding standard limits',
        requesterId: 'T005',
        requesterName: 'Jennifer Taylor',
        requesterRole: 'teller',
        requesterBranch: 'South Branch',
        submittedAt: new Date('2024-01-12T11:00:00'),
        dueDate: new Date('2024-01-15T11:00:00'),
        priority: 'high',
        status: 'rejected',
        reviewedBy: 'Robert Brown',
        reviewedAt: new Date('2024-01-13T10:00:00'),
        decision: 'reject',
        decisionNotes: 'Exceeds branch cash holding policy, request smaller amount',
        decisionAt: new Date('2024-01-13T10:30:00'),
        escalationLevel: 1,
        maxEscalationLevel: 2,
        attachments: [
          {
            id: '10',
            name: 'cash_order_form.pdf',
            type: 'pdf',
            size: '1.5 MB',
            uploadedAt: new Date('2024-01-12T11:00:00'),
            uploadedBy: 'Jennifer Taylor',
            url: '#'
          }
        ],
        relatedDocuments: [
          {
            id: '7',
            type: 'Branch Policy',
            reference: 'POL-CASH001',
            description: 'Cash holding limits',
            date: new Date('2023-12-01')
          }
        ],
        riskLevel: 'high',
        complianceCheck: true,
        amount: 150000,
        currency: 'USD',
        impactAnalysis: 'Security risk, insurance limitations',
        slaStatus: 'on_time'
      }
    ];
    
    this.applyFilters();
  }
  
loadWorkflows(): void {
  this.workflows = [
    {
      id: '1',
      requestId: 'APR20240115001',
      currentStep: 2,
      completed: false,
      steps: [
        {
          step: 1,
          name: 'Initial Review',
          approverRole: 'supervisor',
          approverId: 'S001',
          approverName: 'John Supervisor',
          status: 'approved',
          actionAt: new Date('2024-01-15T09:40:00'),
          actionNotes: 'Documents verified',
          slaHours: 2
        },
        {
          step: 2,
          name: 'Manager Approval',
          approverRole: 'manager',
          approverId: 'M001',
          approverName: 'Robert Brown',
          status: 'pending',
          slaHours: 4
        },
        {
          step: 3,
          name: 'Compliance Check',
          approverRole: 'compliance',
          status: 'pending', // ✅ FIX
          slaHours: 8
        }
      ]
    },
    {
      id: '2',
      requestId: 'APR20240115003',
      currentStep: 2,
      completed: false,
      steps: [
        {
          step: 1,
          name: 'AML Screening',
          approverRole: 'compliance',
          approverId: 'CO001',
          approverName: 'Emma Martinez',
          status: 'approved',
          actionAt: new Date('2024-01-15T12:00:00'),
          actionNotes: 'No sanctions match',
          slaHours: 2
        },
        {
          step: 2,
          name: 'Manager Approval',
          approverRole: 'manager',
          approverId: 'M001',
          approverName: 'Robert Brown',
          status: 'pending',
          slaHours: 4
        },
        {
          step: 3,
          name: 'Final Verification',
          approverRole: 'senior_manager',
          status: 'pending', // ✅ FIX
          slaHours: 4
        }
      ]
    }
  ];
}

  
  applyFilters(): void {
    this.filteredRequests = this.approvalRequests.filter(request => {
      // Search filter
      const searchMatch = !this.searchTerm || 
        request.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.requestId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        request.requesterName.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Type filter
      const typeMatch = this.selectedType === 'all' || request.type === this.selectedType;
      
      // Status filter
      const statusMatch = this.selectedStatus === 'all' || request.status === this.selectedStatus;
      
      // Priority filter
      const priorityMatch = this.selectedPriority === 'all' || request.priority === this.selectedPriority;
      
      // Risk filter
      const riskMatch = this.selectedRisk === 'all' || request.riskLevel === this.selectedRisk;
      
      // SLA filter
      const slaMatch = this.selectedSla === 'all' || request.slaStatus === this.selectedSla;
      
      return searchMatch && typeMatch && statusMatch && priorityMatch && riskMatch && slaMatch;
    });
    
    // Sort
    this.sortRequests();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    // Update statistics
    this.calculateStatistics();
  }
  
  sortRequests(): void {
    this.filteredRequests.sort((a, b) => {
      const aRaw = a[this.sortColumn as keyof ApprovalRequest];
      const bRaw = b[this.sortColumn as keyof ApprovalRequest];
      
      // Handle undefined values
      if (aRaw == null && bRaw == null) return 0;
      if (aRaw == null) return 1;
      if (bRaw == null) return -1;
      
      const aValue =
        aRaw instanceof Date ? aRaw.getTime() : aRaw.toString().toLowerCase();
      const bValue =
        bRaw instanceof Date ? bRaw.getTime() : bRaw.toString().toLowerCase();
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortRequests();
  }
  
  get paginatedRequests(): ApprovalRequest[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    
    if (this.totalPages <= maxPages) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + maxPages - 1);
      
      if (end - start + 1 < maxPages) {
        start = end - maxPages + 1;
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  }
  
  calculateStatistics(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.stats.totalPending = this.approvalRequests.filter(
      req => req.status === 'pending'
    ).length;
    
    this.stats.approvedToday = this.approvalRequests.filter(
      req => req.status === 'approved' && 
      req.decisionAt && 
      new Date(req.decisionAt) >= today
    ).length;
    
    this.stats.rejectedToday = this.approvalRequests.filter(
      req => req.status === 'rejected' && 
      req.decisionAt && 
      new Date(req.decisionAt) >= today
    ).length;
    
    // Calculate average response time (in hours)
    const completedRequests = this.approvalRequests.filter(
      req => (req.status === 'approved' || req.status === 'rejected') && 
      req.submittedAt && 
      req.decisionAt
    );
    
    if (completedRequests.length > 0) {
      const totalHours = completedRequests.reduce((sum, req) => {
        const submitted = new Date(req.submittedAt).getTime();
        const decided = new Date(req.decisionAt!).getTime();
        const hours = (decided - submitted) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      this.stats.avgResponseTime = Math.round(totalHours / completedRequests.length);
    }
    
    // Calculate SLA compliance
    const slaRequests = this.approvalRequests.filter(
      req => req.dueDate && req.decisionAt
    );
    
    if (slaRequests.length > 0) {
      const metSla = slaRequests.filter(
        req => new Date(req.decisionAt!) <= new Date(req.dueDate)
      ).length;
      this.stats.slaCompliance = Math.round((metSla / slaRequests.length) * 100);
    }
    
    // Count by type
    this.stats.byType = this.approvalTypes
      .filter(type => type.value !== 'all')
      .map(type => ({
        type: type.label,
        count: this.approvalRequests.filter(req => req.type === type.value).length
      }));
    
    // Count by priority
    this.stats.byPriority = this.priorities
      .filter(priority => priority.value !== 'all')
      .map(priority => ({
        priority: priority.label,
        count: this.approvalRequests.filter(req => req.priority === priority.value).length
      }));
    
    // Count overdue
    this.stats.overdue = this.approvalRequests.filter(req => {
      if (!req.dueDate || req.status === 'approved' || req.status === 'rejected') return false;
      return new Date() > new Date(req.dueDate);
    }).length;
  }
  
  // Helper methods
  getTypeLabel(type: string): string {
    return this.approvalTypes.find(t => t.value === type)?.label || type;
  }
  
  getTypeColor(type: string): string {
    return this.approvalTypes.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
  
  getStatusColor(status: string): string {
    return this.statuses.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getPriorityLabel(priority: string): string {
    return this.priorities.find(p => p.value === priority)?.label || priority;
  }
  
  getPriorityColor(priority: string): string {
    return this.priorities.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getRiskLabel(risk: string): string {
    return this.riskLevels.find(r => r.value === risk)?.label || risk;
  }
  
  getRiskColor(risk: string): string {
    return this.riskLevels.find(r => r.value === risk)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getSlaLabel(sla: string): string {
    return this.slaStatuses.find(s => s.value === sla)?.label || sla;
  }
  
  getSlaColor(sla: string): string {
    return this.slaStatuses.find(s => s.value === sla)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getDecisionLabel(decision: string): string {
    return this.decisionOptions.find(d => d.value === decision)?.label || decision;
  }
  
  getDecisionIcon(decision: string): string {
    return this.decisionOptions.find(d => d.value === decision)?.icon || '📋';
  }
  
  


  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatCurrency(amount?: number): string {
    if (!amount) return 'N/A';
    return '$' + amount.toLocaleString('en-US');
  }
  
  getTimeRemaining(dueDate: Date): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMs < 0) return 'Overdue';
    if (diffHours < 1) return '< 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days`;
  }
  
  getSlaProgress(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const totalHours = 24; // Assume 24-hour SLA for calculation
    
    const elapsedMs = now.getTime() - (due.getTime() - (totalHours * 60 * 60 * 1000));
    const progress = (elapsedMs / (totalHours * 60 * 60 * 1000)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  }
  
  // View request details
  viewRequestDetails(request: ApprovalRequest): void {
    this.selectedRequest = request;
    this.showRequestDetails = true;
    
    // Find workflow for this request
    this.requestWorkflow = this.workflows.find(
      w => w.requestId === request.requestId
    ) || null;
  }
  
  closeRequestDetails(): void {
    this.selectedRequest = null;
    this.showRequestDetails = false;
    this.requestWorkflow = null;
  }
  
  // Decision making
  openDecisionModal(request: ApprovalRequest, decision: 'approve' | 'reject' | 'escalate' | 'request_info' = 'approve'): void {
    this.selectedRequest = request;
    this.decisionType = decision;
    this.decisionNotes = '';
    this.showDecisionModal = true;
  }
  
  closeDecisionModal(): void {
    this.showDecisionModal = false;
    this.selectedRequest = null;
    this.decisionNotes = '';
  }
  
  submitDecision(): void {
    if (!this.selectedRequest || !this.decisionNotes.trim()) {
      alert('Please provide decision notes');
      return;
    }
    
    const index = this.approvalRequests.findIndex(
      req => req.id === this.selectedRequest!.id
    );
    
    if (index !== -1) {
      const now = new Date();
      
      if (this.decisionType === 'escalate') {
        // Escalate to next level
        this.approvalRequests[index].escalationLevel += 1;
        this.approvalRequests[index].status = 'escalated';
        this.approvalRequests[index].reviewedBy = this.currentUser.name;
        this.approvalRequests[index].reviewedAt = now;
        this.approvalRequests[index].reviewNotes = this.decisionNotes;
        
        // Update workflow if exists
        const workflowIndex = this.workflows.findIndex(
          w => w.requestId === this.selectedRequest!.requestId
        );
        
        if (workflowIndex !== -1) {
          const currentStep = this.workflows[workflowIndex].steps.find(
            step => step.step === this.workflows[workflowIndex].currentStep
          );
          
          if (currentStep) {
            currentStep.status = 'escalated';
            currentStep.actionAt = now;
            currentStep.actionNotes = `Escalated: ${this.decisionNotes}`;
            this.workflows[workflowIndex].currentStep += 1;
          }
        }
        
      } else if (this.decisionType === 'request_info') {
        // Request more information
        this.approvalRequests[index].status = 'reviewed';
        this.approvalRequests[index].reviewedBy = this.currentUser.name;
        this.approvalRequests[index].reviewedAt = now;
        this.approvalRequests[index].reviewNotes = this.decisionNotes;
        
      } else {
        // Approve or reject
        this.approvalRequests[index].status = this.decisionType === 'approve' ? 'approved' : 'rejected';
        this.approvalRequests[index].reviewedBy = this.currentUser.name;
        this.approvalRequests[index].reviewedAt = now;
        this.approvalRequests[index].decision = this.decisionType;
        this.approvalRequests[index].decisionNotes = this.decisionNotes;
        this.approvalRequests[index].decisionAt = now;
        
        // Update workflow if exists
        const workflowIndex = this.workflows.findIndex(
          w => w.requestId === this.selectedRequest!.requestId
        );
        
        if (workflowIndex !== -1) {
          const currentStep = this.workflows[workflowIndex].steps.find(
            step => step.step === this.workflows[workflowIndex].currentStep
          );
          
          if (currentStep) {
            currentStep.status = this.decisionType === 'approve' ? 'approved' : 'rejected';
            currentStep.actionAt = now;
            currentStep.actionNotes = this.decisionNotes;
            currentStep.approverId = this.currentUser.id;
            currentStep.approverName = this.currentUser.name;
            
            if (this.decisionType === 'approve') {
              this.workflows[workflowIndex].currentStep += 1;
              if (this.workflows[workflowIndex].currentStep > this.workflows[workflowIndex].steps.length) {
                this.workflows[workflowIndex].completed = true;
              }
            } else {
              this.workflows[workflowIndex].completed = true;
            }
          }
        }
      }
      
      this.applyFilters();
      this.closeDecisionModal();
      this.closeRequestDetails();
      
      alert(`Decision submitted: ${this.getDecisionLabel(this.decisionType)}`);
    }
  }
  
  // Quick actions
  assignToMe(request: ApprovalRequest): void {
    const index = this.approvalRequests.findIndex(req => req.id === request.id);
    if (index !== -1) {
      this.approvalRequests[index].assignedTo = this.currentUser.id;
      this.approvalRequests[index].assignedToName = this.currentUser.name;
      this.approvalRequests[index].assignedAt = new Date();
      this.applyFilters();
      alert('Request assigned to you');
    }
  }
  
  markAsReviewed(request: ApprovalRequest): void {
    const index = this.approvalRequests.findIndex(req => req.id === request.id);
    if (index !== -1) {
      this.approvalRequests[index].status = 'reviewed';
      this.approvalRequests[index].reviewedBy = this.currentUser.name;
      this.approvalRequests[index].reviewedAt = new Date();
      this.applyFilters();
      alert('Request marked as reviewed');
    }
  }
  
  // Filter shortcuts
  showMyAssignments(): void {
    this.selectedStatus = 'pending';
    this.searchTerm = '';
    this.applyFilters();
  }
  
  showOverdue(): void {
    this.selectedSla = 'breached';
    this.applyFilters();
  }
  
  showHighPriority(): void {
    this.selectedPriority = 'urgent';
    this.applyFilters();
  }
  
  // Export functionality
  exportRequests(): void {
    const data = this.filteredRequests.map(req => ({
      'Request ID': req.requestId,
      'Type': this.getTypeLabel(req.type),
      'Title': req.title,
      'Status': this.getStatusLabel(req.status),
      'Priority': this.getPriorityLabel(req.priority),
      'Requester': req.requesterName,
      'Submitted At': this.formatDateTime(req.submittedAt),
      'Due Date': this.formatDateTime(req.dueDate),
      'Risk Level': this.getRiskLabel(req.riskLevel),
      'SLA Status': this.getSlaLabel(req.slaStatus),
      'Amount': req.amount ? this.formatCurrency(req.amount) : 'N/A'
    }));
    
    this.exportToCSV(data, 'approval-requests');
  }
  
  exportToCSV(data: any[], filename: string): void {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  // Get requests by type for charts
  getRequestsByType(): { name: string; value: number }[] {
    return this.stats.byType.map(type => ({
      name: type.type,
      value: type.count
    }));
  }
  
  getRequestsByPriority(): { name: string; value: number }[] {
    return this.stats.byPriority.map(priority => ({
      name: priority.priority,
      value: priority.count
    }));
  }
}