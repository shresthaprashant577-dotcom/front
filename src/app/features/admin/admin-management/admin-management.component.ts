import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../../shared/shared.routes';

interface SystemUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'manager' | 'teller' | 'customer_service' | 'support';
  department: string;
  branch: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  permissions: string[];
  phone?: string;
  twoFactorEnabled: boolean;
  lastPasswordChange?: Date;
  
}

interface SystemConfig {
  id: string;
  category: 'security' | 'transaction' | 'system' | 'notifications' | 'compliance' | 'api';
  key: string;
  value: any;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  editable: boolean;
  requiresRestart: boolean;
  updatedAt: Date;
  updatedBy: string;
}

interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  details?: any;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  resolved: boolean;
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface SystemMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  target: number;
}

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'transaction';
  size: number;
  createdAt: Date;
  createdBy: string;
  status: 'completed' | 'failed' | 'in_progress';
  location: string;
  verified: boolean;
  retentionDays: number;
}

interface SystemInfo {
  version: string;
  environment: 'development' | 'staging' | 'production';
  lastUpdated: Date;
  databaseSize: number;
}

interface ActiveConnection {
  id: string;
  ip: string;
  userAgent: string;
  connectedAt: Date;
  lastActivity: Date;
  userId?: string;
  userName?: string;
}

@Component({
  selector: 'app-admin-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DashboardLayoutComponent
  ],
  templateUrl: './admin-management.component.html',
})
export class AdminManagementComponent implements OnInit {
  Math = Math;
  
  // Current admin
  currentAdmin = {
    id: 'SA001',
    name: 'Super Admin',
    role: 'super_admin',
    permissions: ['all']
  };
  
  // Tabs
  activeTab: 'dashboard' | 'users' | 'config' | 'logs' | 'backup' | 'monitoring' = 'dashboard';
  
  // Users data
  systemUsers: SystemUser[] = [];
  filteredUsers: SystemUser[] = [];
  userSearchQuery: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  
  // System configurations
  systemConfigs: SystemConfig[] = [];
  filteredConfigs: SystemConfig[] = [];
  
  // System logs
  systemLogs: SystemLog[] = [];
  filteredLogs: SystemLog[] = [];
  
  // Backups
  backups: Backup[] = [];
  
  // System metrics
  systemMetrics: SystemMetric[] = [];
  
  // Filters
  userRoleFilter: string = 'all';
  userStatusFilter: string = 'all';
  
  logSearchQuery: string = '';
  logLevelFilter: string = 'all';
  logSourceFilter: string = 'all';
  logResolvedFilter: string = 'all';
  
  configSearchTerm: string = '';
  configCategoryFilter: string = 'all';
  
  // Pagination
  totalPages: number = 1;
  
  // Editing
  editingUser: SystemUser | null = null;
  editingConfig: SystemConfig | null = null;
  showUserForm: boolean = false;
  showConfigForm: boolean = false;
    showExportMenu: boolean = false;
  
  // New user/form
  newUser: Partial<SystemUser> = {
    role: 'teller',
    status: 'pending',
    twoFactorEnabled: false,
    permissions: []
  };
  
  // Configuration form
  configForm!: FormGroup;
  
  // Quick settings
  emailNotifications: boolean = true;
  autoBackup: boolean = true;
  performanceMonitoring: boolean = true;
  
  // System info
  systemInfo: SystemInfo = {
    version: '2.5.1',
    environment: 'production',
    lastUpdated: new Date('2024-01-10'),
    databaseSize: 4572000000 // 4.57 GB in bytes
  };
  
  // Backup related
  backupName: string = '';
  includeDatabase: boolean = true;
  includeFiles: boolean = true;
  includeLogs: boolean = false;
  includeConfig: boolean = true;
  encryptionType: string = 'none';
  isCreatingBackup: boolean = false;
  selectedBackup: string = '';
  restoreOption: string = 'full';
  
  // Monitoring related
  refreshInterval: number = 5000;
  isMonitoringActive: boolean = true;
  cpuUsage: number = 45;
  memoryUsage: number = 68;
  diskUsage: number = 72;
  networkIn: number = 2.5;
  networkOut: number = 1.8;
  cpuHistory: number[] = [45, 48, 52, 50, 47, 45, 42, 40, 43, 45];
  memoryHistory: number[] = [68, 70, 72, 75, 73, 70, 68, 65, 67, 68];
  activeConnections: ActiveConnection[] = [];
  
  // User permissions
  availablePermissions = [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'transaction.create',
    'transaction.approve',
    'transaction.reject',
    'account.create',
    'account.update',
    'branch.manage',
    'reports.generate',
    'reports.export',
    'audit.view',
    'audit.export',
    'config.view',
    'config.update',
    'system.monitor',
    'backup.create',
    'backup.restore'
  ];
  
  // Roles
  roles = [
    { value: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-800', permissions: ['all'] },
    { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-800', permissions: ['user.*', 'transaction.*', 'account.*', 'reports.*', 'audit.*'] },
    { value: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-800', permissions: ['transaction.approve', 'user.read', 'reports.generate'] },
    { value: 'teller', label: 'Teller', color: 'bg-green-100 text-green-800', permissions: ['transaction.create', 'account.read'] },
    { value: 'customer_service', label: 'Customer Service', color: 'bg-yellow-100 text-yellow-800', permissions: ['account.read', 'transaction.create'] },
    { value: 'support', label: 'Support', color: 'bg-gray-100 text-gray-800', permissions: ['user.read', 'audit.view'] }
  ];
  
  // Departments
  departments = [
    'Administration',
    'IT Department',
    'Customer Service',
    'Operations',
    'Finance',
    'Compliance',
    'Security',
    'Human Resources',
    'Marketing'
  ];
  
  // Branches
  branches = [
    'Head Office',
    'Downtown Branch',
    'Westside Branch',
    'North Branch',
    'East Branch',
    'South Branch',
    'Central Branch'
  ];
  
  // Log levels
  logLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800' },
    { value: 'warning', label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'error', label: 'Error', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];
  
  // Log sources
  logSources = [
    'Authentication',
    'Transaction',
    'Database',
    'API',
    'Security',
    'System',
    'Backup',
    'Email',
    'SMS'
  ];
  
  // Config categories
  configCategories = [
    'security',
    'transaction',
    'system',
    'notifications',
    'compliance',
    'api'
  ];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadSystemUsers();
    this.loadSystemConfigs();
    this.loadSystemLogs();
    this.loadBackups();
    this.loadSystemMetrics();
    this.loadActiveConnections();
    this.initializeBackupName();
  }
  
  initializeForm(): void {
    this.configForm = this.fb.group({
      appName: ['Banking System', Validators.required],
      apiUrl: ['https://api.bank.com/v1', Validators.required],
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(1440)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      maintenanceMode: [false],
      enableAuditLog: [true],
      twoFactorAuth: [true],
      systemAnnouncement: ['']
    });
  }
  
  initializeBackupName(): void {
    this.backupName = `backup-${this.formatDateForBackup(new Date())}`;
  }
  
  loadSystemUsers(): void {
    // Mock system users data
    this.systemUsers = [
      {
        id: 'SA001',
        username: 'super.admin',
        email: 'super.admin@bank.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        department: 'Administration',
        branch: 'Head Office',
        status: 'active',
        lastLogin: new Date('2024-01-15T08:30:00'),
        loginCount: 245,
        createdAt: new Date('2023-01-01'),
        permissions: ['all'],
        phone: '+1 (555) 111-2222',
        twoFactorEnabled: true,
        lastPasswordChange: new Date('2024-01-01')
      },
      {
        id: 'A001',
        username: 'admin.john',
        email: 'admin.john@bank.com',
        firstName: 'John',
        lastName: 'Smith',
        role: 'admin',
        department: 'IT Department',
        branch: 'Head Office',
        status: 'active',
        lastLogin: new Date('2024-01-15T09:15:00'),
        loginCount: 189,
        createdAt: new Date('2023-02-15'),
        permissions: ['user.*', 'transaction.*', 'account.*', 'reports.*', 'audit.*'],
        phone: '+1 (555) 222-3333',
        twoFactorEnabled: true,
        lastPasswordChange: new Date('2024-01-10')
      },
      {
        id: 'M001',
        username: 'manager.sarah',
        email: 'manager.sarah@bank.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'manager',
        department: 'Operations',
        branch: 'Downtown Branch',
        status: 'active',
        lastLogin: new Date('2024-01-15T10:00:00'),
        loginCount: 156,
        createdAt: new Date('2023-03-20'),
        permissions: ['transaction.approve', 'user.read', 'reports.generate'],
        phone: '+1 (555) 333-4444',
        twoFactorEnabled: false,
        lastPasswordChange: new Date('2023-12-15')
      },
      {
        id: 'T001',
        username: 'teller.mike',
        email: 'teller.mike@bank.com',
        firstName: 'Mike',
        lastName: 'Davis',
        role: 'teller',
        department: 'Customer Service',
        branch: 'Westside Branch',
        status: 'active',
        lastLogin: new Date('2024-01-15T11:30:00'),
        loginCount: 98,
        createdAt: new Date('2023-05-10'),
        permissions: ['transaction.create', 'account.read'],
        phone: '+1 (555) 444-5555',
        twoFactorEnabled: false
      },
      {
        id: 'CS001',
        username: 'cs.anna',
        email: 'cs.anna@bank.com',
        firstName: 'Anna',
        lastName: 'Williams',
        role: 'customer_service',
        department: 'Customer Service',
        branch: 'North Branch',
        status: 'active',
        lastLogin: new Date('2024-01-15T13:45:00'),
        loginCount: 87,
        createdAt: new Date('2023-06-15'),
        permissions: ['account.read', 'transaction.create'],
        phone: '+1 (555) 555-6666',
        twoFactorEnabled: true
      },
      {
        id: 'S001',
        username: 'support.david',
        email: 'support.david@bank.com',
        firstName: 'David',
        lastName: 'Miller',
        role: 'support',
        department: 'IT Department',
        branch: 'Head Office',
        status: 'active',
        lastLogin: new Date('2024-01-14T16:20:00'),
        loginCount: 112,
        createdAt: new Date('2023-04-05'),
        permissions: ['user.read', 'audit.view'],
        phone: '+1 (555) 666-7777',
        twoFactorEnabled: false
      },
      {
        id: 'A002',
        username: 'admin.lisa',
        email: 'admin.lisa@bank.com',
        firstName: 'Lisa',
        lastName: 'Anderson',
        role: 'admin',
        department: 'Compliance',
        branch: 'Head Office',
        status: 'inactive',
        lastLogin: new Date('2024-01-10T14:00:00'),
        loginCount: 76,
        createdAt: new Date('2023-07-22'),
        permissions: ['user.*', 'transaction.*', 'compliance.*'],
        phone: '+1 (555) 777-8888',
        twoFactorEnabled: true
      },
      {
        id: 'T002',
        username: 'teller.jennifer',
        email: 'teller.jennifer@bank.com',
        firstName: 'Jennifer',
        lastName: 'Taylor',
        role: 'teller',
        department: 'Customer Service',
        branch: 'East Branch',
        status: 'suspended',
        lastLogin: new Date('2024-01-05T10:15:00'),
        loginCount: 45,
        createdAt: new Date('2023-08-30'),
        permissions: ['transaction.create', 'account.read'],
        phone: '+1 (555) 888-9999',
        twoFactorEnabled: false
      },
      {
        id: 'M002',
        username: 'manager.robert',
        email: 'manager.robert@bank.com',
        firstName: 'Robert',
        lastName: 'Brown',
        role: 'manager',
        department: 'Finance',
        branch: 'South Branch',
        status: 'pending',
        loginCount: 0,
        createdAt: new Date('2024-01-14'),
        permissions: ['transaction.approve', 'reports.generate'],
        phone: '+1 (555) 999-0000',
        twoFactorEnabled: false
      },
      {
        id: 'CS002',
        username: 'cs.maria',
        email: 'cs.maria@bank.com',
        firstName: 'Maria',
        lastName: 'Garcia',
        role: 'customer_service',
        department: 'Customer Service',
        branch: 'Central Branch',
        status: 'active',
        lastLogin: new Date('2024-01-15T15:30:00'),
        loginCount: 23,
        createdAt: new Date('2024-01-05'),
        permissions: ['account.read', 'transaction.create'],
        phone: '+1 (555) 000-1111',
        twoFactorEnabled: false
      }
    ];
    
    this.filterUsers();
  }
  
  loadSystemConfigs(): void {
    // Mock system configurations
    this.systemConfigs = [
      {
        id: '1',
        category: 'security',
        key: 'login.max_attempts',
        value: 5,
        description: 'Maximum failed login attempts before account lock',
        type: 'number',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-10'),
        updatedBy: 'super.admin'
      },
      {
        id: '2',
        category: 'security',
        key: 'session.timeout_minutes',
        value: 30,
        description: 'User session timeout in minutes',
        type: 'number',
        editable: true,
        requiresRestart: true,
        updatedAt: new Date('2024-01-12'),
        updatedBy: 'admin.john'
      },
      {
        id: '3',
        category: 'security',
        key: 'two_factor.enabled',
        value: true,
        description: 'Enable two-factor authentication',
        type: 'boolean',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-05'),
        updatedBy: 'super.admin'
      },
      {
        id: '4',
        category: 'transaction',
        key: 'daily_withdrawal_limit',
        value: 5000,
        description: 'Maximum daily withdrawal limit per account',
        type: 'number',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-08'),
        updatedBy: 'admin.john'
      },
      {
        id: '5',
        category: 'transaction',
        key: 'transaction_approval_threshold',
        value: 10000,
        description: 'Transaction amount requiring manager approval',
        type: 'number',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-10'),
        updatedBy: 'super.admin'
      },
      {
        id: '6',
        category: 'system',
        key: 'maintenance_mode',
        value: false,
        description: 'Enable system maintenance mode',
        type: 'boolean',
        editable: true,
        requiresRestart: true,
        updatedAt: new Date('2024-01-01'),
        updatedBy: 'super.admin'
      },
      {
        id: '7',
        category: 'system',
        key: 'backup_frequency_hours',
        value: 24,
        description: 'Automatic backup frequency in hours',
        type: 'number',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-03'),
        updatedBy: 'admin.john'
      },
      {
        id: '8',
        category: 'notifications',
        key: 'email_notifications_enabled',
        value: true,
        description: 'Enable email notifications',
        type: 'boolean',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-07'),
        updatedBy: 'admin.john'
      },
      {
        id: '9',
        category: 'notifications',
        key: 'sms_notifications_enabled',
        value: false,
        description: 'Enable SMS notifications',
        type: 'boolean',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-02'),
        updatedBy: 'super.admin'
      },
      {
        id: '10',
        category: 'compliance',
        key: 'audit_log_retention_days',
        value: 365,
        description: 'Number of days to retain audit logs',
        type: 'number',
        editable: true,
        requiresRestart: false,
        updatedAt: new Date('2024-01-05'),
        updatedBy: 'super.admin'
      },
      {
        id: '11',
        category: 'compliance',
        key: 'transaction_monitoring_enabled',
        value: true,
        description: 'Enable real-time transaction monitoring',
        type: 'boolean',
        editable: true,
        requiresRestart: true,
        updatedAt: new Date('2024-01-09'),
        updatedBy: 'admin.john'
      },
      {
        id: '12',
        category: 'api',
        key: 'api_rate_limit',
        value: 100,
        description: 'API requests per minute limit',
        type: 'number',
        editable: true,
        requiresRestart: true,
        updatedAt: new Date('2024-01-04'),
        updatedBy: 'super.admin'
      }
    ];
    
    this.applyConfigFilters();
  }
  
  loadSystemLogs(): void {
    // Mock system logs
    this.systemLogs = [
      {
        id: '1',
        timestamp: new Date('2024-01-15T14:30:00'),
        level: 'info',
        source: 'Authentication',
        message: 'User super.admin logged in successfully',
        userId: 'SA001',
        userName: 'Super Admin',
        ipAddress: '192.168.1.100',
        resolved: true,
        resolvedAt: new Date('2024-01-15T14:30:00'),
        resolvedBy: 'system'
      },
      {
        id: '2',
        timestamp: new Date('2024-01-15T14:25:00'),
        level: 'warning',
        source: 'Authentication',
        message: 'Failed login attempt for user admin.john',
        userId: 'A001',
        userName: 'John Smith',
        ipAddress: '192.168.1.101',
        resolved: true,
        resolvedAt: new Date('2024-01-15T14:26:00'),
        resolvedBy: 'system'
      },
      {
        id: '3',
        timestamp: new Date('2024-01-15T14:20:00'),
        level: 'error',
        source: 'Database',
        message: 'Database connection timeout',
        ipAddress: '192.168.1.1',
        resolved: false,
        resolutionNotes: 'Investigating connection pool issues'
      },
      {
        id: '4',
        timestamp: new Date('2024-01-15T14:15:00'),
        level: 'info',
        source: 'Transaction',
        message: 'Large transaction processed: $25,000',
        userId: 'M001',
        userName: 'Sarah Johnson',
        resolved: true,
        resolvedAt: new Date('2024-01-15T14:15:00'),
        resolvedBy: 'system'
      },
      {
        id: '5',
        timestamp: new Date('2024-01-15T14:10:00'),
        level: 'critical',
        source: 'Security',
        message: 'Multiple failed login attempts detected from IP: 203.0.113.45',
        ipAddress: '203.0.113.45',
        resolved: false
      },
      {
        id: '6',
        timestamp: new Date('2024-01-15T14:05:00'),
        level: 'warning',
        source: 'System',
        message: 'High memory usage detected: 85%',
        resolved: true,
        resolvedAt: new Date('2024-01-15T14:07:00'),
        resolvedBy: 'admin.john',
        resolutionNotes: 'Memory leak in report generation service'
      },
      {
        id: '7',
        timestamp: new Date('2024-01-15T14:00:00'),
        level: 'info',
        source: 'Backup',
        message: 'Daily backup completed successfully',
        resolved: true,
        resolvedAt: new Date('2024-01-15T14:00:00'),
        resolvedBy: 'system'
      },
      {
        id: '8',
        timestamp: new Date('2024-01-15T13:55:00'),
        level: 'error',
        source: 'API',
        message: 'API endpoint /api/transactions returned 500 error',
        resolved: false
      },
      {
        id: '9',
        timestamp: new Date('2024-01-15T13:50:00'),
        level: 'warning',
        source: 'Email',
        message: 'Email service queue size exceeded threshold',
        resolved: true,
        resolvedAt: new Date('2024-01-15T13:52:00'),
        resolvedBy: 'admin.john',
        resolutionNotes: 'Increased queue capacity'
      },
      {
        id: '10',
        timestamp: new Date('2024-01-15T13:45:00'),
        level: 'info',
        source: 'SMS',
        message: 'SMS gateway connection established',
        resolved: true,
        resolvedAt: new Date('2024-01-15T13:45:00'),
        resolvedBy: 'system'
      }
    ];
    
    this.filterLogs();
  }
  
  loadBackups(): void {
    // Mock backups data
    this.backups = [
      {
        id: '1',
        name: 'full_backup_20240115',
        type: 'full',
        size: 45.2 * 1024 * 1024 * 1024, // GB to bytes
        createdAt: new Date('2024-01-15T03:00:00'),
        createdBy: 'system',
        status: 'completed',
        location: '/backups/full_20240115.zip',
        verified: true,
        retentionDays: 30
      },
      {
        id: '2',
        name: 'incremental_backup_20240115',
        type: 'incremental',
        size: 2.8 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-01-15T12:00:00'),
        createdBy: 'system',
        status: 'completed',
        location: '/backups/incremental_20240115.zip',
        verified: true,
        retentionDays: 7
      },
      {
        id: '3',
        name: 'full_backup_20240114',
        type: 'full',
        size: 44.9 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-01-14T03:00:00'),
        createdBy: 'system',
        status: 'completed',
        location: '/backups/full_20240114.zip',
        verified: true,
        retentionDays: 30
      },
      {
        id: '4',
        name: 'transaction_log_backup_20240115',
        type: 'transaction',
        size: 850 * 1024 * 1024, // MB to bytes
        createdAt: new Date('2024-01-15T15:00:00'),
        createdBy: 'admin.john',
        status: 'completed',
        location: '/backups/transaction_logs_20240115.zip',
        verified: true,
        retentionDays: 90
      },
      {
        id: '5',
        name: 'full_backup_20240113',
        type: 'full',
        size: 44.7 * 1024 * 1024 * 1024,
        createdAt: new Date('2024-01-13T03:00:00'),
        createdBy: 'system',
        status: 'failed',
        location: '/backups/full_20240113.zip',
        verified: false,
        retentionDays: 30
      }
    ];
  }
  
  loadSystemMetrics(): void {
    // Mock system metrics
    this.systemMetrics = [
      {
        name: 'Active Users',
        current: 856,
        previous: 832,
        change: 2.9,
        unit: 'users',
        trend: 'up',
        target: 1000
      },
      {
        name: 'Transactions Today',
        current: 2450,
        previous: 2180,
        change: 12.4,
        unit: 'transactions',
        trend: 'up',
        target: 3000
      },
      {
        name: 'System Uptime',
        current: 99.98,
        previous: 99.95,
        change: 0.03,
        unit: '%',
        trend: 'up',
        target: 99.99
      },
      {
        name: 'Response Time',
        current: 145,
        previous: 128,
        change: -13.3,
        unit: 'ms',
        trend: 'down',
        target: 100
      },
      {
        name: 'Failed Logins',
        current: 23,
        previous: 18,
        change: 27.8,
        unit: 'attempts',
        trend: 'down',
        target: 10
      },
      {
        name: 'Database Connections',
        current: 48,
        previous: 52,
        change: -7.7,
        unit: 'connections',
        trend: 'up',
        target: 60
      }
    ];
  }
  
  loadActiveConnections(): void {
    this.activeConnections = [
      {
        id: '1',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        connectedAt: new Date('2024-01-15T14:30:00'),
        lastActivity: new Date('2024-01-15T14:35:00'),
        userId: 'SA001',
        userName: 'Super Admin'
      },
      {
        id: '2',
        ip: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        connectedAt: new Date('2024-01-15T14:25:00'),
        lastActivity: new Date('2024-01-15T14:30:00'),
        userId: 'A001',
        userName: 'John Smith'
      },
      {
        id: '3',
        ip: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        connectedAt: new Date('2024-01-15T14:20:00'),
        lastActivity: new Date('2024-01-15T14:22:00')
      }
    ];
  }
  
  // Tab management
  setActiveTab(tab: 'dashboard' | 'users' | 'config' | 'logs' | 'backup' | 'monitoring'): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }
  
  // User management
  filterUsers(): void {
    this.filteredUsers = this.systemUsers.filter(user => {
      // Search filter
      const searchMatch = !this.userSearchQuery || 
        user.username.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearchQuery.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.userSearchQuery.toLowerCase());
      
      // Role filter
      const roleMatch = this.userRoleFilter === 'all' || user.role === this.userRoleFilter;
      
      // Status filter
      const statusMatch = this.userStatusFilter === 'all' || user.status === this.userStatusFilter;
      
      return searchMatch && roleMatch && statusMatch;
    });
    
    this.updatePagination();
  }
  
  applyConfigFilters(): void {
    this.filteredConfigs = this.systemConfigs.filter(config => {
      // Search filter
      const searchMatch = !this.configSearchTerm || 
        config.key.toLowerCase().includes(this.configSearchTerm.toLowerCase()) ||
        config.description.toLowerCase().includes(this.configSearchTerm.toLowerCase());
      
      // Category filter
      const categoryMatch = this.configCategoryFilter === 'all' || 
        config.category.toLowerCase() === this.configCategoryFilter.toLowerCase();
      
      return searchMatch && categoryMatch;
    });
  }
  
  filterLogs(): void {
    this.filteredLogs = this.systemLogs.filter(log => {
      // Search filter
      const searchMatch = !this.logSearchQuery || 
        log.message.toLowerCase().includes(this.logSearchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(this.logSearchQuery.toLowerCase()) ||
        (log.userName && log.userName.toLowerCase().includes(this.logSearchQuery.toLowerCase()));
      
      // Level filter
      const levelMatch = this.logLevelFilter === 'all' || log.level === this.logLevelFilter;
      
      // Source filter
      const sourceMatch = this.logSourceFilter === 'all' || log.source === this.logSourceFilter;
      
      // Resolved filter
      let resolvedMatch = true;
      if (this.logResolvedFilter === 'resolved') {
        resolvedMatch = log.resolved === true;
      } else if (this.logResolvedFilter === 'unresolved') {
        resolvedMatch = log.resolved === false;
      }
      
      return searchMatch && levelMatch && sourceMatch && resolvedMatch;
    });
    
    this.updatePagination();
  }
  
  updatePagination(): void {
    const items = this.activeTab === 'users' ? this.filteredUsers : 
                  this.activeTab === 'logs' ? this.filteredLogs : 
                  [];
    
    this.totalPages = Math.ceil(items.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
  }
  
  get paginatedUsers(): SystemUser[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(startIndex, startIndex + this.pageSize);
  }
  
  get paginatedLogs(): SystemLog[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredLogs.slice(startIndex, startIndex + this.pageSize);
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  // Helper methods
  getRoleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label || role;
  }
  
  getRoleColor(role: string): string {
    return this.roles.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getStatusLabel(status: string): string {
    switch(status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'suspended': return 'Suspended';
      case 'pending': return 'Pending';
      default: return status;
    }
  }
  
  getStatusColor(status: string): string {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getLevelLabel(level: string): string {
    return this.logLevels.find(l => l.value === level)?.label || level;
  }
  
  getLevelColor(level: string): string {
    return this.logLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  }
  
  getCategoryColor(category: string): string {
    switch(category.toLowerCase()) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'transaction': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'notifications': return 'bg-yellow-100 text-yellow-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'api': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
 formatDateTime(date?: Date): string {
  if (!date) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

  
  formatTime(date: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatTimeAgo(date: Date): string {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return this.formatDate(date);
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  formatDateForBackup(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
  
  // User actions
  editUser(user: SystemUser): void {
    this.editingUser = { ...user };
    this.showUserForm = true;
  }
  
  openAddUserModal(): void {
    this.editingUser = null;
    this.newUser = {
      role: 'teller',
      status: 'pending',
      twoFactorEnabled: false,
      permissions: []
    };
    this.showUserForm = true;
  }
  
  saveUser(): void {
    if (this.editingUser) {
      // Update existing user
      const index = this.systemUsers.findIndex(u => u.id === this.editingUser!.id);
      if (index !== -1) {
        this.systemUsers[index] = { ...this.editingUser };
      }
    } else {
      // Add new user
      const newUser: SystemUser = {
        id: 'U' + (this.systemUsers.length + 1).toString().padStart(3, '0'),
        username: this.newUser.username!,
        email: this.newUser.email!,
        firstName: this.newUser.firstName!,
        lastName: this.newUser.lastName!,
        role: this.newUser.role!,
        department: this.newUser.department!,
        branch: this.newUser.branch!,
        status: this.newUser.status!,
        loginCount: 0,
        createdAt: new Date(),
        permissions: this.newUser.permissions!,
        phone: this.newUser.phone,
        twoFactorEnabled: this.newUser.twoFactorEnabled!,
        lastPasswordChange: new Date()
      };
      
      this.systemUsers.unshift(newUser);
    }
    
    this.filterUsers();
    this.showUserForm = false;
    this.editingUser = null;
  }
  
  cancelUserForm(): void {
    this.showUserForm = false;
    this.editingUser = null;
  }
  
  deleteUser(user: SystemUser): void {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      const index = this.systemUsers.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.systemUsers.splice(index, 1);
        this.filterUsers();
      }
    }
  }
  
  toggleUserStatus(user: SystemUser): void {
    const index = this.systemUsers.findIndex(u => u.id === user.id);
    if (index !== -1) {
      if (user.status === 'active') {
        this.systemUsers[index].status = 'inactive';
      } else {
        this.systemUsers[index].status = 'active';
      }
      this.filterUsers();
    }
  }
  
  // Permission management
  togglePermission(permission: string): void {
    const permissions = this.editingUser?.permissions || this.newUser.permissions || [];
    const index = permissions.indexOf(permission);
    
    if (index === -1) {
      permissions.push(permission);
    } else {
      permissions.splice(index, 1);
    }
    
    if (this.editingUser) {
      this.editingUser.permissions = permissions;
    } else {
      this.newUser.permissions = permissions;
    }
  }
  
  hasPermission(permission: string): boolean {
    const permissions = this.editingUser?.permissions || this.newUser.permissions || [];
    return permissions.includes(permission) || permissions.includes('all');
  }
  
  // Config actions
  editConfig(config: SystemConfig): void {
    this.editingConfig = { ...config };
    this.showConfigForm = true;
  }
  toggleExportMenu(): void {
  this.showExportMenu = !this.showExportMenu;
}

  
  saveConfig(): void {
    if (!this.editingConfig) return;

    const requiresRestart = this.editingConfig.requiresRestart;

    const index = this.systemConfigs.findIndex(c => c.id === this.editingConfig!.id);
    if (index !== -1) {
      this.systemConfigs[index] = {
        ...this.editingConfig,
        updatedAt: new Date(),
        updatedBy: this.currentAdmin.name
      };
    }

    this.applyConfigFilters();
    this.showConfigForm = false;
    this.editingConfig = null;

    if (requiresRestart) {
      alert('Configuration saved. Some changes require system restart to take effect.');
    } else {
      alert('Configuration saved successfully.');
    }
  }
  
  resetConfig(): void {
    this.configForm.reset({
      appName: 'Banking System',
      apiUrl: 'https://api.bank.com/v1',
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      maintenanceMode: false,
      enableAuditLog: true,
      twoFactorAuth: true,
      systemAnnouncement: ''
    });
  }
  
  // Log actions
  markLogAsResolved(log: SystemLog): void {
    const index = this.systemLogs.findIndex(l => l.id === log.id);
    if (index !== -1) {
      this.systemLogs[index].resolved = true;
      this.systemLogs[index].resolvedAt = new Date();
      this.systemLogs[index].resolvedBy = this.currentAdmin.name;
      this.systemLogs[index].resolutionNotes = 'Marked as resolved by admin';
      this.filterLogs();
    }
  }
  
  deleteLog(log: SystemLog): void {
    if (confirm(`Delete log entry: ${log.message.substring(0, 50)}...?`)) {
      const index = this.systemLogs.findIndex(l => l.id === log.id);
      if (index !== -1) {
        this.systemLogs.splice(index, 1);
        this.filterLogs();
      }
    }
  }
  
  clearLogs(): void {
    if (confirm('Clear all system logs? This action cannot be undone.')) {
      this.systemLogs = [];
      this.filterLogs();
      alert('All logs cleared.');
    }
  }
  
  getTodayLogsCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredLogs.filter(log => log.timestamp >= today).length;
  }
  
  // Backup actions
  createBackup(): void {
    this.isCreatingBackup = true;
    
    const newBackup: Backup = {
      id: (this.backups.length + 1).toString(),
      name: this.backupName || `backup-${this.formatDateForBackup(new Date())}`,
      type: 'full',
      size: 0,
      createdAt: new Date(),
      createdBy: this.currentAdmin.name,
      status: 'in_progress',
      location: `/backups/${this.backupName}.zip`,
      verified: false,
      retentionDays: 30
    };
    
    this.backups.unshift(newBackup);
    
    // Simulate backup completion
    setTimeout(() => {
      const index = this.backups.findIndex(b => b.id === newBackup.id);
      if (index !== -1) {
        this.backups[index].status = 'completed';
        this.backups[index].size = 3.2 * 1024 * 1024 * 1024;
        this.backups[index].verified = true;
        this.isCreatingBackup = false;
        alert('Backup completed successfully.');
      }
    }, 3000);
  }
  
  scheduleBackup(): void {
    alert('Backup scheduled. The system will create a backup at the configured time.');
  }
  
  restoreBackup(backup: Backup): void {
    if (confirm(`Restore from backup: ${backup.name}? This will restore the system to the state at ${this.formatDateTime(backup.createdAt)}.`)) {
      alert('Restoration process started. The system will be unavailable during restoration.');
    }
  }
  
  deleteBackup(backup: Backup): void {
    if (confirm(`Delete backup: ${backup.name}?`)) {
      const index = this.backups.findIndex(b => b.id === backup.id);
      if (index !== -1) {
        this.backups.splice(index, 1);
      }
    }
  }
  
  verifyBackup(backup: Backup): void {
    const index = this.backups.findIndex(b => b.id === backup.id);
    if (index !== -1) {
      this.backups[index].verified = true;
      alert('Backup verified successfully.');
    }
  }
  
  downloadBackup(): void {
    if (this.selectedBackup) {
      const backup = this.backups.find(b => b.id === this.selectedBackup);
      if (backup) {
        alert(`Downloading backup: ${backup.name}`);
        // In a real app, this would trigger a file download
      }
    }
  }
  
  initiateRestore(): void {
    if (this.selectedBackup && confirm(`Initiate restore with option: ${this.restoreOption}?`)) {
      alert(`Restoration process started with ${this.restoreOption} option.`);
    }
  }
  
  getSelectedBackupSize(): string {
    const backup = this.backups.find(b => b.id === this.selectedBackup);
    return backup ? this.formatFileSize(backup.size) : 'N/A';
  }
  
  getSelectedBackupDate(): string {
    const backup = this.backups.find(b => b.id === this.selectedBackup);
    return backup ? this.formatDateTime(backup.createdAt) : 'N/A';
  }
  
  getSelectedBackupType(): string {
    const backup = this.backups.find(b => b.id === this.selectedBackup);
    return backup ? backup.type.charAt(0).toUpperCase() + backup.type.slice(1) : 'N/A';
  }
  
  calculateTotalStorage(): string {
    const totalBytes = this.backups.reduce((sum, backup) => sum + backup.size, 0);
    return this.formatFileSize(totalBytes);
  }
  
  // Monitoring actions
  toggleMonitoring(): void {
    this.isMonitoringActive = !this.isMonitoringActive;
  }
  
  updateMonitoring(): void {
    // In a real app, this would update monitoring data
    console.log('Monitoring interval updated:', this.refreshInterval);
  }
  
  terminateConnection(connection: ActiveConnection): void {
    if (confirm(`Terminate connection from ${connection.ip}?`)) {
      const index = this.activeConnections.findIndex(c => c.id === connection.id);
      if (index !== -1) {
        this.activeConnections.splice(index, 1);
      }
    }
  }
  
  // System actions
  restartSystem(): void {
    if (confirm('Restart the banking system? This will log out all users and temporarily interrupt services.')) {
      alert('System restart initiated. Services will be unavailable for approximately 2 minutes.');
    }
  }
  
  maintenanceMode(enable: boolean): void {
    if (enable) {
      if (confirm('Enable maintenance mode? This will prevent all users from accessing the system.')) {
        alert('Maintenance mode enabled. All users will see a maintenance message.');
      }
    } else {
      alert('Maintenance mode disabled. System is now accessible.');
    }
  }
  
  // Statistics
  get totalUsers(): number {
    return this.systemUsers.length;
  }
  
  get activeUsersCount(): number {
    return this.systemUsers.filter(u => u.status === 'active').length;
  }
  
  get systemHealth(): number {
    const errorLogs = this.systemLogs.filter(l => l.level === 'error' || l.level === 'critical').length;
    const totalLogs = this.systemLogs.length;
    if (totalLogs === 0) return 100;
    return Math.max(0, 100 - (errorLogs / totalLogs * 100));
  }
  
  get recentLogs(): SystemLog[] {
    return this.systemLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  }
  
  get recentUsers(): SystemUser[] {
    return this.systemUsers
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }
  get criticalLogCount(): number {
  return this.systemLogs.filter(l => l.level === 'critical').length;
}

get errorLogCount(): number {
  return this.systemLogs.filter(l => l.level === 'error').length;
}

get warningLogCount(): number {
  return this.systemLogs.filter(l => l.level === 'warning').length;
}

get lastRestartFormatted(): string {
  return this.formatDateTime(new Date());
}

get currentDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

  
  // Export data
  exportData(type: 'users' | 'logs' | 'config'): void {
    let data: any[];
    let filename: string;
    
    switch(type) {
      case 'users':
        data = this.systemUsers.map(user => ({
          'User ID': user.id,
          'Username': user.username,
          'Email': user.email,
          'Name': `${user.firstName} ${user.lastName}`,
          'Role': this.getRoleLabel(user.role),
          'Department': user.department,
          'Branch': user.branch,
          'Status': this.getStatusLabel(user.status),
          'Last Login': user.lastLogin ? this.formatDateTime(user.lastLogin) : 'Never',
          'Created': this.formatDate(user.createdAt)
        }));
        filename = 'system-users';
        break;
        
      case 'logs':
        data = this.systemLogs.map(log => ({
          'Timestamp': this.formatDateTime(log.timestamp),
          'Level': this.getLevelLabel(log.level),
          'Source': log.source,
          'Message': log.message,
          'User': log.userName || 'System',
          'IP': log.ipAddress || 'N/A',
          'Resolved': log.resolved ? 'Yes' : 'No'
        }));
        filename = 'system-logs';
        break;
        
      case 'config':
        data = this.systemConfigs.map(config => ({
          'Category': config.category,
          'Key': config.key,
          'Value': config.value,
          'Description': config.description,
          'Type': config.type,
          'Editable': config.editable ? 'Yes' : 'No',
          'Last Updated': this.formatDateTime(config.updatedAt),
          'Updated By': config.updatedBy
        }));
        filename = 'system-config';
        break;
    }
    
    this.exportToCSV(data, filename);
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
}