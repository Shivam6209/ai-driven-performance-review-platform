import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/auth/entities/user.entity';
import { Employee } from '../../modules/employees/entities/employee.entity';
import { Department } from '../../modules/departments/entities/department.entity';
import { OKR } from '../../modules/okrs/entities/okr.entity';
import { Feedback } from '../../modules/feedback/entities/feedback.entity';
import { PerformanceReview } from '../../modules/reviews/entities/performance-review.entity';
import { ReviewCycle } from '../../modules/reviews/entities/review-cycle.entity';
import { ReviewTemplate } from '../../modules/reviews/entities/review-template.entity';
import { ReviewSection } from '../../modules/reviews/entities/review-section.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { Permission } from '../../modules/rbac/entities/permission.entity';
import { RoleAssignment } from '../../modules/rbac/entities/role-assignment.entity';
import { UserRole } from '../../modules/auth/enums/user-role.enum';
import { OKRLevel } from '../../modules/okrs/enums/okr-level.enum';
import { OKRCategory } from '../../modules/okrs/enums/okr-category.enum';
import { OKRStatus } from '../../modules/okrs/enums/okr-status.enum';
import { OKRPriority } from '../../modules/okrs/enums/okr-priority.enum';

export async function seedComprehensiveData(dataSource: DataSource) {
  console.log('🌱 Starting comprehensive data seeding...');

  const userRepository = dataSource.getRepository(User);
  const employeeRepository = dataSource.getRepository(Employee);
  const departmentRepository = dataSource.getRepository(Department);
  const okrRepository = dataSource.getRepository(OKR);
  const feedbackRepository = dataSource.getRepository(Feedback);
  const reviewRepository = dataSource.getRepository(PerformanceReview);
  const reviewCycleRepository = dataSource.getRepository(ReviewCycle);
  const reviewTemplateRepository = dataSource.getRepository(ReviewTemplate);
  const reviewSectionRepository = dataSource.getRepository(ReviewSection);
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const roleAssignmentRepository = dataSource.getRepository(RoleAssignment);

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  
  // Use query builder to truncate tables safely
  await roleAssignmentRepository.query('TRUNCATE TABLE role_assignments CASCADE');
  await roleRepository.query('TRUNCATE TABLE role_permissions CASCADE');
  await roleRepository.query('TRUNCATE TABLE roles CASCADE');
  await permissionRepository.query('TRUNCATE TABLE permissions CASCADE');
  await reviewSectionRepository.query('TRUNCATE TABLE review_sections CASCADE');
  await reviewRepository.query('TRUNCATE TABLE performance_reviews CASCADE');
  await reviewCycleRepository.query('TRUNCATE TABLE review_cycles CASCADE');
  await reviewTemplateRepository.query('TRUNCATE TABLE review_templates CASCADE');
  await feedbackRepository.query('TRUNCATE TABLE feedback CASCADE');
  await okrRepository.query('TRUNCATE TABLE okrs CASCADE');
  await employeeRepository.query('TRUNCATE TABLE employees CASCADE');
  await userRepository.query('TRUNCATE TABLE users CASCADE');
  await departmentRepository.query('TRUNCATE TABLE departments CASCADE');

  // 0. Create RBAC Permissions and Roles
  console.log('🔐 Creating RBAC permissions and roles...');
  
  // Create Permissions
  const permissions = [
    // Reviews permissions
    { name: 'reviews:read', resource: 'reviews', action: 'read', description: 'Read performance reviews' },
    { name: 'reviews:create', resource: 'reviews', action: 'create', description: 'Create performance reviews' },
    { name: 'reviews:update', resource: 'reviews', action: 'update', description: 'Update performance reviews' },
    { name: 'reviews:delete', resource: 'reviews', action: 'delete', description: 'Delete performance reviews' },
    
    // Review cycles permissions
    { name: 'review_cycles:read', resource: 'review_cycles', action: 'read', description: 'Read review cycles' },
    { name: 'review_cycles:create', resource: 'review_cycles', action: 'create', description: 'Create review cycles' },
    { name: 'review_cycles:update', resource: 'review_cycles', action: 'update', description: 'Update review cycles' },
    
    // Review templates permissions
    { name: 'review_templates:read', resource: 'review_templates', action: 'read', description: 'Read review templates' },
    { name: 'review_templates:create', resource: 'review_templates', action: 'create', description: 'Create review templates' },
    { name: 'review_templates:update', resource: 'review_templates', action: 'update', description: 'Update review templates' },
    
    // OKRs permissions
    { name: 'okrs:read', resource: 'okrs', action: 'read', description: 'Read OKRs' },
    { name: 'okrs:create', resource: 'okrs', action: 'create', description: 'Create OKRs' },
    { name: 'okrs:update', resource: 'okrs', action: 'update', description: 'Update OKRs' },
    { name: 'okrs:delete', resource: 'okrs', action: 'delete', description: 'Delete OKRs' },
    
    // Analytics permissions
    { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'Read analytics data' },
    
    // RBAC permissions
    { name: 'rbac:read_roles', resource: 'rbac', action: 'read_roles', description: 'Read roles' },
    { name: 'rbac:create_role', resource: 'rbac', action: 'create_role', description: 'Create roles' },
    { name: 'rbac:update_role', resource: 'rbac', action: 'update_role', description: 'Update roles' },
    { name: 'rbac:delete_role', resource: 'rbac', action: 'delete_role', description: 'Delete roles' },
    { name: 'rbac:read_permissions', resource: 'rbac', action: 'read_permissions', description: 'Read permissions' },
    { name: 'rbac:create_permission', resource: 'rbac', action: 'create_permission', description: 'Create permissions' },
    { name: 'rbac:assign_role', resource: 'rbac', action: 'assign_role', description: 'Assign roles' },
    { name: 'rbac:revoke_role', resource: 'rbac', action: 'revoke_role', description: 'Revoke roles' },
  ];

  const createdPermissions: Permission[] = [];
  for (const permData of permissions) {
    const permission = permissionRepository.create({
      name: permData.name,
      resource: permData.resource,
      action: permData.action,
      description: permData.description,
      is_system_permission: true,
    });
    const savedPermission = await permissionRepository.save(permission);
    createdPermissions.push(savedPermission);
  }

  // Create Roles
  const hrAdminRole = roleRepository.create({
    name: 'HR Admin',
    description: 'Full access to all HR functions',
    is_system_role: true,
    is_custom: false,
    permissions: createdPermissions, // HR Admin gets all permissions
  });
  await roleRepository.save(hrAdminRole);

  const managerRole = roleRepository.create({
    name: 'Manager',
    description: 'Manager access to team reviews and OKRs',
    is_system_role: true,
    is_custom: false,
    permissions: createdPermissions.filter(p => 
      p.resource === 'reviews' || 
      p.resource === 'okrs' || 
      p.resource === 'analytics' ||
      p.resource === 'review_cycles' ||
      p.resource === 'review_templates'
    ),
  });
  await roleRepository.save(managerRole);

  const employeeRole = roleRepository.create({
    name: 'Employee',
    description: 'Basic employee access to own reviews and OKRs',
    is_system_role: true,
    is_custom: false,
    permissions: createdPermissions.filter(p => 
      (p.resource === 'reviews' && (p.action === 'read' || p.action === 'create')) ||
      (p.resource === 'okrs' && (p.action === 'read' || p.action === 'create' || p.action === 'update'))
    ),
  });
  await roleRepository.save(employeeRole);

  // Create Departments first
  console.log('🏢 Creating Departments...');
  
  const hrDept = departmentRepository.create({
    name: 'Human Resources',
    description: 'HR Department',
  });
  await departmentRepository.save(hrDept);

  const engineeringDept = departmentRepository.create({
    name: 'Engineering',
    description: 'Engineering Department',
  });
  await departmentRepository.save(engineeringDept);

  const marketingDept = departmentRepository.create({
    name: 'Marketing',
    description: 'Marketing Department',
  });
  await departmentRepository.save(marketingDept);

  // 1. Create System Admin
  console.log('🔧 Creating System Admin...');
  const systemAdminPassword = await bcrypt.hash('password123', 10);
  const systemAdminUser = userRepository.create({
    email: 'admin@company.com',
    password: systemAdminPassword,
    role: UserRole.ADMIN,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(systemAdminUser);

  const systemAdmin = employeeRepository.create({
    employeeCode: 'ADM001',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@company.com',
    displayName: 'System Administrator',
    jobTitle: 'System Administrator',
    role: UserRole.ADMIN as any,
    hireDate: new Date('2019-01-01'),
    employmentStatus: 'active',
    timezone: 'America/New_York',
    isActive: true,
    user: systemAdminUser,
  });
  await employeeRepository.save(systemAdmin);

  systemAdminUser.employeeId = systemAdmin.id;
  await userRepository.save(systemAdminUser);

  // 2. Create HR Admin
  console.log('👑 Creating HR Admin...');
  const hrAdminPassword = await bcrypt.hash('password123', 10);
  const hrAdminUser = userRepository.create({
    email: 'hr.admin@company.com',
    password: hrAdminPassword,
    role: UserRole.HR, // Back to HR role
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(hrAdminUser);

  const hrAdmin = employeeRepository.create({
    employeeCode: 'HR001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'hr.admin@company.com',
    displayName: 'Sarah Johnson',
    jobTitle: 'HR Director',
    role: UserRole.HR as any, // Back to HR role
    departmentId: hrDept.id,
    hireDate: new Date('2020-01-15'),
    employmentStatus: 'active',
    timezone: 'America/New_York',
    isActive: true,
    user: hrAdminUser,
  });
  await employeeRepository.save(hrAdmin);

  // Update user with employee reference
  hrAdminUser.employeeId = hrAdmin.id;
  await userRepository.save(hrAdminUser);

  // 3. Create Engineering Manager
  console.log('👨‍💼 Creating Engineering Manager...');
  const engManagerPassword = await bcrypt.hash('password123', 10);
  const engManagerUser = userRepository.create({
    email: 'john.smith@company.com',
    password: engManagerPassword,
    role: UserRole.MANAGER,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(engManagerUser);

  const engManager = employeeRepository.create({
    employeeCode: 'ENG001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    displayName: 'John Smith',
    jobTitle: 'Engineering Manager',
    role: UserRole.MANAGER as any,
    departmentId: engineeringDept.id,
    hireDate: new Date('2019-03-10'),
    employmentStatus: 'active',
    timezone: 'America/Los_Angeles',
    isActive: true,
    user: engManagerUser,
  });
  await employeeRepository.save(engManager);

  engManagerUser.employeeId = engManager.id;
  await userRepository.save(engManagerUser);

  // 4. Create Marketing Manager
  console.log('👩‍💼 Creating Marketing Manager...');
  const mktManagerPassword = await bcrypt.hash('password123', 10);
  const mktManagerUser = userRepository.create({
    email: 'emily.davis@company.com',
    password: mktManagerPassword,
    role: UserRole.MANAGER,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(mktManagerUser);

  const mktManager = employeeRepository.create({
    employeeCode: 'MKT001',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@company.com',
    displayName: 'Emily Davis',
    jobTitle: 'Marketing Manager',
    role: UserRole.MANAGER as any,
    departmentId: marketingDept.id,
    hireDate: new Date('2019-06-20'),
    employmentStatus: 'active',
    timezone: 'America/Chicago',
    isActive: true,
    user: mktManagerUser,
  });
  await employeeRepository.save(mktManager);

  mktManagerUser.employeeId = mktManager.id;
  await userRepository.save(mktManagerUser);

  // Update department heads
  engineeringDept.manager = engManager;
  marketingDept.manager = mktManager;
  hrDept.manager = hrAdmin;
  await departmentRepository.save([engineeringDept, marketingDept, hrDept]);

  // 4.5. Assign HR Personnel to Departments (Many-to-Many)
  console.log('🔗 Assigning HR personnel to departments...');
  
  // HR Admin should be able to manage all departments
  hrAdmin.hrDepartments = [engineeringDept, marketingDept, hrDept];
  await employeeRepository.save(hrAdmin);
  
  // Update departments with HR personnel
  engineeringDept.hrPersonnel = [hrAdmin];
  marketingDept.hrPersonnel = [hrAdmin];
  hrDept.hrPersonnel = [hrAdmin];
  await departmentRepository.save([engineeringDept, marketingDept, hrDept]);

  // 5. Create Engineering Employees
  console.log('👨‍💻 Creating Engineering Employees...');
  
  // Engineering Employee 1
  const engEmp1Password = await bcrypt.hash('password123', 10);
  const engEmp1User = userRepository.create({
    email: 'alex.wilson@company.com',
    password: engEmp1Password,
    role: UserRole.EMPLOYEE,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(engEmp1User);

  const engEmp1 = employeeRepository.create({
    employeeCode: 'ENG002',
    firstName: 'Alex',
    lastName: 'Wilson',
    email: 'alex.wilson@company.com',
    displayName: 'Alex Wilson',
    jobTitle: 'Senior Software Engineer',
    role: UserRole.EMPLOYEE as any,
    departmentId: engineeringDept.id,
    managerId: engManager.id,
    hireDate: new Date('2021-02-15'),
    employmentStatus: 'active',
    timezone: 'America/Los_Angeles',
    isActive: true,
    user: engEmp1User,
  });
  await employeeRepository.save(engEmp1);

  engEmp1User.employeeId = engEmp1.id;
  await userRepository.save(engEmp1User);

  // Engineering Employee 2
  const engEmp2Password = await bcrypt.hash('password123', 10);
  const engEmp2User = userRepository.create({
    email: 'maria.garcia@company.com',
    password: engEmp2Password,
    role: UserRole.EMPLOYEE,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(engEmp2User);

  const engEmp2 = employeeRepository.create({
    employeeCode: 'ENG003',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@company.com',
    displayName: 'Maria Garcia',
    jobTitle: 'Frontend Developer',
    role: UserRole.EMPLOYEE as any,
    departmentId: engineeringDept.id,
    managerId: engManager.id,
    hireDate: new Date('2021-08-01'),
    employmentStatus: 'active',
    timezone: 'America/New_York',
    isActive: true,
    user: engEmp2User,
  });
  await employeeRepository.save(engEmp2);

  engEmp2User.employeeId = engEmp2.id;
  await userRepository.save(engEmp2User);

  // 6. Create Marketing Employees
  console.log('📢 Creating Marketing Employees...');
  
  // Marketing Employee 1
  const mktEmp1Password = await bcrypt.hash('password123', 10);
  const mktEmp1User = userRepository.create({
    email: 'david.brown@company.com',
    password: mktEmp1Password,
    role: UserRole.EMPLOYEE,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(mktEmp1User);

  const mktEmp1 = employeeRepository.create({
    employeeCode: 'MKT002',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@company.com',
    displayName: 'David Brown',
    jobTitle: 'Digital Marketing Specialist',
    role: UserRole.EMPLOYEE as any,
    departmentId: marketingDept.id,
    managerId: mktManager.id,
    hireDate: new Date('2021-04-10'),
    employmentStatus: 'active',
    timezone: 'America/Chicago',
    isActive: true,
    user: mktEmp1User,
  });
  await employeeRepository.save(mktEmp1);

  mktEmp1User.employeeId = mktEmp1.id;
  await userRepository.save(mktEmp1User);

  // Marketing Employee 2
  const mktEmp2Password = await bcrypt.hash('password123', 10);
  const mktEmp2User = userRepository.create({
    email: 'lisa.taylor@company.com',
    password: mktEmp2Password,
    role: UserRole.EMPLOYEE,
    isActive: true,
    isEmailVerified: true,
  });
  await userRepository.save(mktEmp2User);

  const mktEmp2 = employeeRepository.create({
    employeeCode: 'MKT003',
    firstName: 'Lisa',
    lastName: 'Taylor',
    email: 'lisa.taylor@company.com',
    displayName: 'Lisa Taylor',
    jobTitle: 'Content Marketing Manager',
    role: UserRole.EMPLOYEE as any,
    departmentId: marketingDept.id,
    managerId: mktManager.id,
    hireDate: new Date('2021-09-15'),
    employmentStatus: 'active',
    timezone: 'America/Denver',
    isActive: true,
    user: mktEmp2User,
  });
  await employeeRepository.save(mktEmp2);

  mktEmp2User.employeeId = mktEmp2.id;
  await userRepository.save(mktEmp2User);

  // 6.5. Assign RBAC Roles to Users
  console.log('🔗 Assigning RBAC roles to users...');
  
  // Assign HR Admin role
  const hrAdminAssignment = roleAssignmentRepository.create({
    employee_id: hrAdmin.id,
    role: hrAdminRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(hrAdminAssignment);

  // Assign Manager roles
  const engManagerAssignment = roleAssignmentRepository.create({
    employee_id: engManager.id,
    role: managerRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(engManagerAssignment);

  const mktManagerAssignment = roleAssignmentRepository.create({
    employee_id: mktManager.id,
    role: managerRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(mktManagerAssignment);

  // Assign Employee roles
  const engEmp1Assignment = roleAssignmentRepository.create({
    employee_id: engEmp1.id,
    role: employeeRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(engEmp1Assignment);

  const engEmp2Assignment = roleAssignmentRepository.create({
    employee_id: engEmp2.id,
    role: employeeRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(engEmp2Assignment);

  const mktEmp1Assignment = roleAssignmentRepository.create({
    employee_id: mktEmp1.id,
    role: employeeRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(mktEmp1Assignment);

  const mktEmp2Assignment = roleAssignmentRepository.create({
    employee_id: mktEmp2.id,
    role: employeeRole,
    assigned_by_id: hrAdmin.id,
    assigned_at: new Date(),
    granted_by: hrAdmin.id,
    valid_from: new Date(),
    is_active: true,
  });
  await roleAssignmentRepository.save(mktEmp2Assignment);

  // 7. Create Company-Level OKRs
  console.log('🎯 Creating Company OKRs...');
  const companyOKR1 = okrRepository.create({
    employee_id: hrAdmin.id,
    title: 'Increase Annual Revenue by 40%',
    description: 'Drive company growth through new customer acquisition and retention',
    level: OKRLevel.COMPANY,
    category: OKRCategory.REVENUE,
    target_value: 40,
    current_value: 25,
    unit_of_measure: 'percentage',
    weight: 1.0,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-01'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 62.5,
    approved_by_id: hrAdmin.id,
    approved_at: new Date('2024-01-05'),
  });
  await okrRepository.save(companyOKR1);

  const companyOKR2 = okrRepository.create({
    employee_id: hrAdmin.id,
    title: 'Improve Employee Satisfaction Score to 4.5/5',
    description: 'Enhance workplace culture and employee experience',
    level: OKRLevel.COMPANY,
    category: OKRCategory.QUALITY,
    target_value: 4.5,
    current_value: 4.1,
    unit_of_measure: 'rating',
    weight: 0.8,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-01'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 80,
    approved_by_id: hrAdmin.id,
    approved_at: new Date('2024-01-05'),
  });
  await okrRepository.save(companyOKR2);

  // 8. Create Department OKRs
  console.log('🏢 Creating Department OKRs...');
  
  // Engineering Department OKRs
  const engDeptOKR1 = okrRepository.create({
    employee_id: engManager.id,
    parent_okr: companyOKR1,
    title: 'Launch 3 Major Product Features',
    description: 'Deliver key features to support revenue growth',
    level: OKRLevel.DEPARTMENT,
    category: OKRCategory.INNOVATION,
    target_value: 3,
    current_value: 2,
    unit_of_measure: 'features',
    weight: 1.0,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-01'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 66.7,
    approved_by_id: hrAdmin.id,
    approved_at: new Date('2024-01-10'),
  });
  await okrRepository.save(engDeptOKR1);

  const engDeptOKR2 = okrRepository.create({
    employee_id: engManager.id,
    title: 'Reduce System Downtime to <0.1%',
    description: 'Improve system reliability and performance',
    level: OKRLevel.DEPARTMENT,
    category: OKRCategory.EFFICIENCY,
    target_value: 0.1,
    current_value: 0.15,
    unit_of_measure: 'percentage',
    weight: 0.9,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-01'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 70,
    approved_by_id: hrAdmin.id,
    approved_at: new Date('2024-01-10'),
  });
  await okrRepository.save(engDeptOKR2);

  // Marketing Department OKRs
  const mktDeptOKR1 = okrRepository.create({
    employee_id: mktManager.id,
    parent_okr: companyOKR1,
    title: 'Generate 500 Qualified Leads per Month',
    description: 'Increase lead generation to support sales growth',
    level: OKRLevel.DEPARTMENT,
    category: OKRCategory.GROWTH,
    target_value: 500,
    current_value: 420,
    unit_of_measure: 'leads',
    weight: 1.0,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-01'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 84,
    approved_by_id: hrAdmin.id,
    approved_at: new Date('2024-01-10'),
  });
  await okrRepository.save(mktDeptOKR1);

  // 9. Create Individual OKRs
  console.log('👤 Creating Individual OKRs...');
  
  // Alex Wilson (Engineering) OKRs
  const alexOKR1 = okrRepository.create({
    employee_id: engEmp1.id,
    parent_okr: engDeptOKR1,
    title: 'Implement Advanced Analytics Dashboard',
    description: 'Build comprehensive analytics dashboard for customer insights',
    level: OKRLevel.INDIVIDUAL,
    category: OKRCategory.INNOVATION,
    target_value: 1,
    current_value: 0.8,
    unit_of_measure: 'feature',
    weight: 1.0,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-06-30'),
    status: OKRStatus.IN_PROGRESS,
    progress: 80,
    approved_by_id: engManager.id,
    approved_at: new Date('2024-01-20'),
  });
  await okrRepository.save(alexOKR1);

  const alexOKR2 = okrRepository.create({
    employee_id: engEmp1.id,
    title: 'Mentor 2 Junior Developers',
    description: 'Provide technical guidance and career development support',
    level: OKRLevel.INDIVIDUAL,
    category: OKRCategory.GENERAL,
    target_value: 2,
    current_value: 1,
    unit_of_measure: 'people',
    weight: 0.7,
    priority: OKRPriority.MEDIUM,
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 50,
    approved_by_id: engManager.id,
    approved_at: new Date('2024-01-20'),
  });
  await okrRepository.save(alexOKR2);

  // Maria Garcia (Engineering) OKRs
  const mariaOKR1 = okrRepository.create({
    employee_id: engEmp2.id,
    parent_okr: engDeptOKR1,
    title: 'Redesign User Interface for Mobile App',
    description: 'Improve user experience and mobile responsiveness',
    level: OKRLevel.INDIVIDUAL,
    category: OKRCategory.QUALITY,
    target_value: 1,
    current_value: 0.6,
    unit_of_measure: 'project',
    weight: 1.0,
    priority: OKRPriority.HIGH,
    start_date: new Date('2024-02-01'),
    due_date: new Date('2024-08-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 60,
    approved_by_id: engManager.id,
    approved_at: new Date('2024-02-05'),
  });
  await okrRepository.save(mariaOKR1);

  // David Brown (Marketing) OKRs
  const davidOKR1 = okrRepository.create({
    employee_id: mktEmp1.id,
    parent_okr: mktDeptOKR1,
    title: 'Increase Social Media Engagement by 150%',
    description: 'Grow social media presence and community engagement',
    level: OKRLevel.INDIVIDUAL,
    category: OKRCategory.CUSTOMER,
    target_value: 150,
    current_value: 95,
    unit_of_measure: 'percentage',
    weight: 0.9,
    priority: OKRPriority.MEDIUM,
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 63.3,
    approved_by_id: mktManager.id,
    approved_at: new Date('2024-01-20'),
  });
  await okrRepository.save(davidOKR1);

  // Lisa Taylor (Marketing) OKRs
  const lisaOKR1 = okrRepository.create({
    employee_id: mktEmp2.id,
    title: 'Publish 50 High-Quality Blog Posts',
    description: 'Create valuable content to drive organic traffic and leads',
    level: OKRLevel.INDIVIDUAL,
    category: OKRCategory.GROWTH,
    target_value: 50,
    current_value: 32,
    unit_of_measure: 'posts',
    weight: 0.8,
    priority: OKRPriority.MEDIUM,
    start_date: new Date('2024-01-15'),
    due_date: new Date('2024-12-31'),
    status: OKRStatus.IN_PROGRESS,
    progress: 64,
    approved_by_id: mktManager.id,
    approved_at: new Date('2024-01-20'),
  });
  await okrRepository.save(lisaOKR1);

  // 10. Create Feedback
  console.log('💬 Creating Feedback...');
  
  // Manager to Employee Feedback
  const feedback1 = feedbackRepository.create({
    content: 'Alex has shown exceptional technical leadership on the analytics dashboard project. His code quality is outstanding and he consistently delivers ahead of schedule. I particularly appreciate his proactive approach to identifying potential issues before they become problems.',
    visibility: 'private',
    givenById: engManager.id,
    receiverId: engEmp1.id,
    contextType: 'goal',
    contextId: alexOKR1.id,
    tone: 'positive',
    qualityScore: 0.92,
  });
  await feedbackRepository.save(feedback1);

  const feedback2 = feedbackRepository.create({
    content: 'Maria\'s UI/UX skills have improved significantly over the past quarter. The mobile app redesign is looking fantastic. I\'d like to see her take on more complex frontend challenges and perhaps lead a small team on the next project.',
    visibility: 'private',
    givenById: engManager.id,
    receiverId: engEmp2.id,
    contextType: 'goal',
    contextId: mariaOKR1.id,
    tone: 'positive',
    qualityScore: 0.88,
  });
  await feedbackRepository.save(feedback2);

  const feedback3 = feedbackRepository.create({
    content: 'David\'s social media campaigns have been incredibly creative and effective. The engagement metrics speak for themselves. I\'d love to see him experiment with video content and perhaps collaborate more closely with the design team.',
    visibility: 'private',
    givenById: mktManager.id,
    receiverId: mktEmp1.id,
    contextType: 'goal',
    contextId: davidOKR1.id,
    tone: 'positive',
    qualityScore: 0.90,
  });
  await feedbackRepository.save(feedback3);

  // Peer-to-Peer Feedback
  const feedback4 = feedbackRepository.create({
    content: 'Working with Alex on the analytics integration has been great. He\'s always willing to help debug issues and explains complex concepts clearly. His mentoring style is very supportive and encouraging.',
    visibility: 'public',
    givenById: engEmp2.id,
    receiverId: engEmp1.id,
    contextType: 'general',
    tone: 'positive',
    qualityScore: 0.85,
  });
  await feedbackRepository.save(feedback4);

  const feedback5 = feedbackRepository.create({
    content: 'Maria brings fresh perspectives to our frontend discussions. Her attention to detail in UI components is impressive, and she\'s great at catching accessibility issues that others might miss.',
    visibility: 'public',
    givenById: engEmp1.id,
    receiverId: engEmp2.id,
    contextType: 'general',
    tone: 'positive',
    qualityScore: 0.87,
  });
  await feedbackRepository.save(feedback5);

  // Cross-Department Feedback
  const feedback6 = feedbackRepository.create({
    content: 'David has been fantastic to work with on the product launch campaign. He really understands our technical constraints and finds creative ways to communicate complex features to our audience.',
    visibility: 'public',
    givenById: engEmp1.id,
    receiverId: mktEmp1.id,
    contextType: 'project',
    tone: 'positive',
    qualityScore: 0.89,
  });
  await feedbackRepository.save(feedback6);

  // Upward Feedback (Employee to Manager)
  const feedback7 = feedbackRepository.create({
    content: 'John provides excellent technical guidance and is always available when I need support. I appreciate how he balances giving me autonomy while ensuring I have the resources I need. His weekly 1:1s are very valuable.',
    visibility: 'manager_only',
    givenById: engEmp1.id,
    receiverId: engManager.id,
    contextType: 'general',
    tone: 'positive',
    qualityScore: 0.91,
  });
  await feedbackRepository.save(feedback7);

  // Constructive Feedback
  const feedback8 = feedbackRepository.create({
    content: 'While Lisa\'s content quality is excellent, I think there\'s an opportunity to improve our content distribution strategy. Perhaps we could explore more partnerships with industry publications and guest posting opportunities.',
    visibility: 'private',
    givenById: mktManager.id,
    receiverId: mktEmp2.id,
    contextType: 'goal',
    contextId: lisaOKR1.id,
    tone: 'neutral',
    qualityScore: 0.83,
  });
  await feedbackRepository.save(feedback8);

  // 11. Create Review Cycles
  console.log('🔄 Creating Review Cycles...');
  
  const q1ReviewCycle = reviewCycleRepository.create({
    name: 'Q1 2024 Performance Review',
    description: 'First quarter performance evaluation cycle',
    cycle_type: 'quarterly',
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-03-31'),
    submission_deadline: new Date('2024-04-15'),
    approval_deadline: new Date('2024-04-30'),
    status: 'completed',
    created_by: hrAdmin,
  });
  await reviewCycleRepository.save(q1ReviewCycle);

  const q2ReviewCycle = reviewCycleRepository.create({
    name: 'Q2 2024 Performance Review',
    description: 'Second quarter performance evaluation cycle',
    cycle_type: 'quarterly',
    start_date: new Date('2024-04-01'),
    end_date: new Date('2024-06-30'),
    submission_deadline: new Date('2024-07-15'),
    approval_deadline: new Date('2024-07-31'),
    status: 'active',
    created_by: hrAdmin,
  });
  await reviewCycleRepository.save(q2ReviewCycle);

  // 12. Create Review Templates
  console.log('📋 Creating Review Templates...');
  
  const managerReviewTemplate = reviewTemplateRepository.create({
    name: 'Standard Manager Review Template',
    description: 'Template for manager-conducted performance reviews',
    review_type: 'manager',
    template_structure: {
      sections: [
        { name: 'Goal Achievement', weight: 0.4 },
        { name: 'Technical Skills', weight: 0.3 },
        { name: 'Communication & Collaboration', weight: 0.2 },
        { name: 'Professional Development', weight: 0.1 }
      ]
    },
    is_active: true,
    is_default: true,
    created_by: hrAdmin,
  });
  await reviewTemplateRepository.save(managerReviewTemplate);

  const selfReviewTemplate = reviewTemplateRepository.create({
    name: 'Self-Assessment Template',
    description: 'Template for employee self-assessments',
    review_type: 'self',
    template_structure: {
      sections: [
        { name: 'Key Accomplishments', weight: 0.3 },
        { name: 'Goal Progress', weight: 0.3 },
        { name: 'Challenges & Learning', weight: 0.2 },
        { name: 'Future Goals', weight: 0.2 }
      ]
    },
    is_active: true,
    is_default: true,
    created_by: hrAdmin,
  });
  await reviewTemplateRepository.save(selfReviewTemplate);

  // 13. Create Performance Reviews
  console.log('📊 Creating Performance Reviews...');
  
  // Alex Wilson's Q1 Review
  const alexQ1Review = reviewRepository.create({
    employee_id: engEmp1.id,
    reviewer: engManager,
    review_cycle: q1ReviewCycle,
    review_type: 'manager',
    status: 'approved',
    overall_rating: 4.5,
    submitted_at: new Date('2024-04-10'),
    approved_at: new Date('2024-04-12'),
    approved_by: hrAdmin,
    due_date: new Date('2024-04-15'),
  });
  await reviewRepository.save(alexQ1Review);

  // Create review sections for Alex's review
  const alexReviewSection1 = reviewSectionRepository.create({
    reviewId: alexQ1Review.id,
    name: 'Goal Achievement',
    content: 'Alex has exceeded expectations in goal achievement this quarter. The analytics dashboard project is 80% complete and ahead of schedule. His technical approach has been methodical and well-documented.',
    rating: 4.5,
    section_order: 1,
  });
  await reviewSectionRepository.save(alexReviewSection1);

  const alexReviewSection2 = reviewSectionRepository.create({
    reviewId: alexQ1Review.id,
    name: 'Technical Skills',
    content: 'Demonstrates strong technical expertise in full-stack development. Has shown leadership in architectural decisions and code review processes. Consistently writes clean, maintainable code.',
    rating: 4.7,
    section_order: 2,
  });
  await reviewSectionRepository.save(alexReviewSection2);

  // Maria Garcia's Q1 Review
  const mariaQ1Review = reviewRepository.create({
    employee_id: engEmp2.id,
    reviewer: engManager,
    review_cycle: q1ReviewCycle,
    review_type: 'manager',
    status: 'approved',
    overall_rating: 4.2,
    submitted_at: new Date('2024-04-12'),
    approved_at: new Date('2024-04-14'),
    approved_by: hrAdmin,
    due_date: new Date('2024-04-15'),
  });
  await reviewRepository.save(mariaQ1Review);

  // David Brown's Q1 Review
  const davidQ1Review = reviewRepository.create({
    employee_id: mktEmp1.id,
    reviewer: mktManager,
    review_cycle: q1ReviewCycle,
    review_type: 'manager',
    status: 'approved',
    overall_rating: 4.3,
    submitted_at: new Date('2024-04-11'),
    approved_at: new Date('2024-04-13'),
    approved_by: hrAdmin,
    due_date: new Date('2024-04-15'),
  });
  await reviewRepository.save(davidQ1Review);

  // Lisa Taylor's Q1 Review
  const lisaQ1Review = reviewRepository.create({
    employee_id: mktEmp2.id,
    reviewer: mktManager,
    review_cycle: q1ReviewCycle,
    review_type: 'manager',
    status: 'approved',
    overall_rating: 4.0,
    submitted_at: new Date('2024-04-13'),
    approved_at: new Date('2024-04-15'),
    approved_by: hrAdmin,
    due_date: new Date('2024-04-15'),
  });
  await reviewRepository.save(lisaQ1Review);

  // Self-Assessment Reviews
  const alexSelfReview = reviewRepository.create({
    employee_id: engEmp1.id,
    reviewer: engEmp1,
    review_cycle: q2ReviewCycle,
    review_type: 'self',
    status: 'submitted',
    overall_rating: 4.2,
    submitted_at: new Date('2024-07-10'),
    due_date: new Date('2024-07-15'),
  });
  await reviewRepository.save(alexSelfReview);

  // Peer Reviews
  const alexPeerReview = reviewRepository.create({
    employee_id: engEmp1.id,
    reviewer: engEmp2,
    review_cycle: q2ReviewCycle,
    review_type: 'peer',
    status: 'submitted',
    overall_rating: 4.4,
    submitted_at: new Date('2024-07-08'),
    due_date: new Date('2024-07-15'),
  });
  await reviewRepository.save(alexPeerReview);

  console.log('✅ Comprehensive data seeding completed successfully!');
  console.log('\n📊 Summary of created data:');
  console.log('- 1 System Admin (System Administrator)');
  console.log('- 1 HR Admin (Sarah Johnson)');
  console.log('- 2 Managers (John Smith - Engineering, Emily Davis - Marketing)');
  console.log('- 4 Employees (2 Engineering, 2 Marketing)');
  console.log('- 3 Departments (Engineering, Marketing, HR)');
  console.log('- 12 OKRs (Company, Department, and Individual levels)');
  console.log('- 8 Feedback entries (Manager, Peer, Cross-department, Upward)');
  console.log('- 2 Review Cycles (Q1 completed, Q2 active)');
  console.log('- 2 Review Templates (Manager and Self-assessment)');
  console.log('- 6 Performance Reviews (Q1 manager reviews + Q2 self/peer reviews)');
  console.log('\n🔐 Login Credentials:');
  console.log('System Admin: admin@company.com / password123');
  console.log('HR Admin: hr.admin@company.com / password123');
  console.log('Eng Manager: john.smith@company.com / password123');
  console.log('Mkt Manager: emily.davis@company.com / password123');
  console.log('Employees: alex.wilson@company.com, maria.garcia@company.com, david.brown@company.com, lisa.taylor@company.com / password123');
}