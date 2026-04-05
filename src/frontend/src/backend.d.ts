import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Class {
    id: Identifier;
    subjects: Subjects;
    name: Name;
    teacherId: Identifier;
}
export type ApplicantId = string;
export type GradeLevel = string;
export type MaxScore = bigint;
export type DepartmentId = string;
export interface Teacher {
    id: Identifier;
    subjects: Subjects;
    isActive: IsActive;
    grade?: string;
    contactEmail: ContactEmail;
    lastName: string;
    dateOfJoin: DateOfJoin;
    contactPhone: ContactPhone;
    firstName: string;
}
export interface Lesson {
    id: Identifier;
    title: Title;
    contentText: ContentText;
    courseId: CourseId;
    orderIndex: OrderIndex;
}
export interface StudentInvoice {
    id: string;
    status: string;
    studentId: Identifier;
    feeStructureId: string;
    dueDate: bigint;
    issuedDate: bigint;
    amount: bigint;
}
export type Title = string;
export type EndDate = bigint;
export interface ResourceLink {
    id: string;
    url: string;
    title: string;
    resourceType: string;
    courseId: string;
}
export type DueDate = bigint;
export type CourseId = string;
export interface AttendanceRecord {
    absentStudents: Array<Identifier>;
    date: bigint;
    classId: Identifier;
    presentStudents: Array<Identifier>;
}
export type Identifier = string;
export type Subject = string;
export interface Assignment {
    id: Identifier;
    title: Title;
    maxScore: MaxScore;
    dueDate: DueDate;
    instructions: Instructions;
    courseId: CourseId;
}
export interface Student {
    id: Identifier;
    dob?: bigint;
    isActive: IsActive;
    grade: Grade;
    contactEmail: ContactEmail;
    enrollmentDate: EnrollmentDate;
    lastName: string;
    parentName: ParentName;
    contactPhone: ContactPhone;
    firstName: string;
}
export interface SalarySlipData {
    month: bigint;
    staffId: string;
    year: bigint;
    deductions: bigint;
    netSalary: bigint;
    allowances: bigint;
    basicSalary: bigint;
}
export type ContentText = string;
export type ParentName = string;
export type Score = bigint;
export interface GradeRecord {
    studentId: Identifier;
    subject: Subject;
    term: Term;
    score: Score;
    remarks: Remarks;
}
export type Name = string;
export interface Payment {
    id: string;
    method: string;
    studentId: Identifier;
    invoiceId: string;
    notes: string;
    paymentDate: bigint;
    amount: bigint;
}
export type Notes = string;
export interface Expense {
    id: string;
    date: bigint;
    approvedBy: string;
    description: string;
    category: string;
    amount: bigint;
}
export interface AssignmentSubmission {
    id: string;
    studentId: Identifier;
    submittedAt: bigint;
    feedback?: string;
    isGraded: boolean;
    score?: bigint;
    assignmentId: Identifier;
    submissionText: string;
}
export interface Applicant {
    id: ApplicantId;
    status: string;
    classApplied: string;
    email: string;
    dateApplied: bigint;
    programApplied: string;
    notes: Notes;
    phone: string;
    lastName: string;
    firstName: string;
}
export interface TeacherAttendance {
    id: string;
    status: string;
    date: bigint;
    notes: string;
    teacherId: string;
}
export interface Department {
    id: string;
    name: string;
    description: string;
}
export type Position = string;
export interface AttendanceRecordInput {
    absentStudents: Array<Identifier>;
    date: bigint;
    classId: Identifier;
    presentStudents: Array<Identifier>;
}
export type Term = string;
export interface AttendanceCorrection {
    id: string;
    status: string;
    staffId: string;
    date: bigint;
    requestedStatus: string;
    reason: string;
}
export type IsActive = boolean;
export type AuthorName = string;
export interface UserProfile {
    linkedId?: string;
    name: string;
    role: string;
}
export type Salary = bigint;
export type Timestamp = bigint;
export type StartDate = bigint;
export type LeaveType = string;
export type Remarks = string;
export interface Course {
    id: string;
    title: string;
    subject: string;
    description: string;
    classId: string;
    isActive: boolean;
    teacherId: string;
}
export interface FeeStructure {
    id: FeeId;
    name: string;
    feeType: string;
    description: string;
    isActive: IsActive;
    academicYear: string;
    gradeLevel: GradeLevel;
    feeTypeLabel: string;
    amount: bigint;
}
export type Instructions = string;
export type Grade = bigint;
export type FeeId = string;
export interface LeaveRequest {
    id: Identifier;
    status: Status;
    endDate: EndDate;
    staffId: StaffId;
    leaveType: LeaveType;
    startDate: StartDate;
    reason: Reason;
}
export type OrderIndex = bigint;
export interface Staff {
    id: Identifier;
    salary: Salary;
    hireDate: HireDate;
    isActive: IsActive;
    employmentType: EmploymentType;
    contactEmail: ContactEmail;
    position: Position;
    lastName: string;
    departmentId: DepartmentId;
    contactPhone: ContactPhone;
    firstName: string;
}
export type EnrollmentDate = bigint;
export interface Announcement {
    id: string;
    title: Title;
    body: Body;
    authorName: AuthorName;
    timestamp: Timestamp;
}
export type DateOfJoin = bigint;
export interface SchoolProfile {
    motto: string;
    email: string;
    address: string;
    phone: string;
    schoolName: string;
}
export type ContactPhone = string;
export type StaffId = string;
export type EmploymentType = string;
export interface PayrollRecord {
    id: string;
    month: bigint;
    staffId: string;
    year: bigint;
    deductions: bigint;
    isPaid: boolean;
    netPay: bigint;
    allowances: bigint;
    basicSalary: bigint;
}
export type Body = string;
export type ContactEmail = string;
export type HireDate = bigint;
export type Status = string;
export type Reason = string;
export type Subjects = Array<string>;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrUpdateAssignment(courseId: CourseId, title: Title, instructions: Instructions, dueDate: DueDate, maxScore: MaxScore): Promise<Identifier>;
    addOrUpdateCourse(title: string, description: string, teacherId: string, classId: string, subject: string, isActive: boolean): Promise<string>;
    addOrUpdateDepartment(id: string, name: string, description: string): Promise<string>;
    addOrUpdateLesson(courseId: CourseId, title: Title, contentText: ContentText, orderIndex: OrderIndex): Promise<Identifier>;
    addResourceLink(courseId: string, title: string, url: string, resourceType: string): Promise<string>;
    addTeacherAttendance(teacherId: string, date: bigint, status: string, notes: string): Promise<string>;
    approveAttendanceCorrection(id: string): Promise<void>;
    approveLeaveRequest(leaveRequestId: Identifier): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    convertApplicantToStudent(applicantId: string): Promise<Identifier>;
    createAnnouncement(title: Title, body: Body, authorName: AuthorName): Promise<string>;
    createApplicant(firstName: string, lastName: string, email: string, phone: string, programApplied: string, classApplied: string, dateApplied: bigint, status: string, notes: Notes): Promise<string>;
    createClass(name: Name, teacherId: Identifier, subjects: Subjects): Promise<Identifier>;
    createExpense(category: string, description: string, amount: bigint, date: bigint, approvedBy: string): Promise<string>;
    createFeeStructure(name: string, description: string, amount: bigint, gradeLevel: GradeLevel, academicYear: string, feeType: string, feeTypeLabel: string, isActive: IsActive): Promise<string>;
    createPayment(invoiceId: string, studentId: Identifier, amount: bigint, paymentDate: bigint, method: string, notes: string): Promise<string>;
    createStaff(firstName: string, lastName: string, position: Position, departmentId: DepartmentId, employmentType: EmploymentType, salary: Salary, contactEmail: ContactEmail, contactPhone: ContactPhone, hireDate: HireDate, isActive: IsActive): Promise<Identifier>;
    createStudent(firstName: string, lastName: string, grade: Grade, contactEmail: ContactEmail, contactPhone: ContactPhone, parentName: ParentName, enrollmentDate: EnrollmentDate, dob: bigint | null, isActive: IsActive): Promise<Identifier>;
    createStudentInvoice(studentId: Identifier, feeStructureId: string, amount: bigint, dueDate: bigint, status: string, issuedDate: bigint): Promise<string>;
    createTeacher(firstName: string, lastName: string, subjects: Subjects, contactEmail: ContactEmail, contactPhone: ContactPhone, dateOfJoin: DateOfJoin, grade: string | null, isActive: IsActive): Promise<Identifier>;
    deleteApplicant(id: string): Promise<void>;
    deleteClass(id: Identifier): Promise<void>;
    deleteCourse(id: string): Promise<void>;
    deleteDepartment(id: string): Promise<void>;
    deleteExpense(id: string): Promise<void>;
    deleteFeeStructure(id: string): Promise<void>;
    deletePayment(id: string): Promise<void>;
    deleteStaff(id: Identifier): Promise<void>;
    deleteStudent(id: Identifier): Promise<void>;
    deleteStudentInvoice(id: string): Promise<void>;
    deleteTeacher(id: Identifier): Promise<void>;
    enrollStudentInClass(classId: Identifier, studentId: Identifier | null): Promise<void>;
    generatePayroll(staffId: string, month: bigint, year: bigint, basicSalary: bigint, allowances: bigint, deductions: bigint, netPay: bigint): Promise<string>;
    getActiveLMSCourses(): Promise<Array<Course>>;
    getActiveStaff(): Promise<Array<Staff>>;
    getActiveStudents(): Promise<Array<Student>>;
    getActiveTeachers(): Promise<Array<Teacher>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllApplicants(): Promise<Array<Applicant>>;
    getAllClasses(): Promise<Array<Class>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllDepartments(): Promise<Array<Department>>;
    getAllExpenses(): Promise<Array<Expense>>;
    getAllFeeStructures(): Promise<Array<FeeStructure>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllResourceLinks(): Promise<Array<ResourceLink>>;
    getAllStaff(): Promise<Array<Staff>>;
    getAllStudentInvoices(): Promise<Array<StudentInvoice>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAnnouncement(id: string): Promise<Announcement>;
    getApplicant(id: string): Promise<Applicant>;
    getApplicantsByStatus(status: string): Promise<Array<Applicant>>;
    getAssignment(id: Identifier): Promise<Assignment>;
    getAssignmentsByCourse(courseId: CourseId): Promise<Array<Assignment>>;
    getAttendance(classId: string): Promise<Array<AttendanceRecord>>;
    getAttendanceByClassAndDate(classId: Identifier, date: bigint): Promise<Array<AttendanceRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClass(id: Identifier): Promise<Class>;
    getCourse(id: string): Promise<Course>;
    getDashboardStats(): Promise<{
        totalClasses: bigint;
        totalStudents: bigint;
        totalStaff: bigint;
        totalTeachers: bigint;
        totalCourses: bigint;
    }>;
    getDepartment(id: string): Promise<Department>;
    getExpense(id: string): Promise<Expense>;
    getFeeStructure(id: string): Promise<FeeStructure>;
    getGrade(gradeId: string): Promise<GradeRecord>;
    getGradesByStudent(studentId: Identifier): Promise<Array<GradeRecord>>;
    getGradesBySubject(subject: Subject): Promise<Array<GradeRecord>>;
    getLeaveRequest(id: Identifier): Promise<LeaveRequest>;
    getLeaveRequestsByStaff(staffId: string): Promise<Array<LeaveRequest>>;
    getLeaveRequestsByStaffId(staffId: string): Promise<Array<LeaveRequest>>;
    getLesson(id: Identifier): Promise<Lesson>;
    getLessonsByCourse(courseId: CourseId): Promise<Array<Lesson>>;
    getOverdueInvoices(): Promise<Array<StudentInvoice>>;
    getPayment(id: string): Promise<Payment>;
    getPayrollRecord(id: string): Promise<PayrollRecord>;
    getPayrollRecordsByStaff(staffId: string): Promise<Array<PayrollRecord>>;
    getAllAttendanceCorrections(): Promise<Array<AttendanceCorrection>>;
    getPendingAttendanceCorrections(): Promise<Array<AttendanceCorrection>>;
    getPendingLeaveRequests(): Promise<Array<LeaveRequest>>;
    getResourceLinksByCourse(courseId: string): Promise<Array<ResourceLink>>;
    getSalarySlipData(staffId: string): Promise<SalarySlipData | null>;
    getSchoolProfile(): Promise<SchoolProfile>;
    getStaff(id: Identifier): Promise<Staff>;
    getStudent(id: Identifier): Promise<Student>;
    getStudentInvoice(id: string): Promise<StudentInvoice>;
    getStudentsSortedByFirstName(): Promise<Array<Student>>;
    getStudentsSortedByLastName(): Promise<Array<Student>>;
    getSubmission(id: string): Promise<AssignmentSubmission>;
    getSubmissionsByAssignment(assignmentId: Identifier): Promise<Array<AssignmentSubmission>>;
    getSubmissionsByStudent(studentId: Identifier): Promise<Array<AssignmentSubmission>>;
    getTeacher(id: Identifier): Promise<Teacher>;
    getTeacherAttendanceByDate(date: bigint): Promise<Array<TeacherAttendance>>;
    getTeacherAttendanceByTeacher(teacherId: string): Promise<Array<TeacherAttendance>>;
    getTotalExpenses(): Promise<bigint>;
    getTotalFeesCollected(): Promise<bigint>;
    getUnpaidInvoices(): Promise<Array<StudentInvoice>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    gradeSubmission(submissionId: string, score: bigint, feedback: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markPayrollAsPaid(payrollId: string): Promise<void>;
    recordAttendance(attendanceInput: AttendanceRecordInput): Promise<string>;
    recordGrade(studentId: Identifier, subject: Subject, term: Term, score: Score, remarks: Remarks): Promise<string>;
    rejectAttendanceCorrection(id: string): Promise<void>;
    rejectLeaveRequest(leaveRequestId: Identifier): Promise<void>;
    removeStudentFromClass(classId: Identifier, studentId: Identifier): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAssignment(assignmentId: Identifier, studentId: Identifier, submissionText: string): Promise<string>;
    submitAttendanceCorrection(staffId: string, date: bigint, requestedStatus: string, reason: string): Promise<string>;
    submitLeaveRequest(staffId: StaffId, leaveType: LeaveType, startDate: StartDate, endDate: EndDate, reason: Reason): Promise<Identifier>;
    updateApplicant(id: string, firstName: string, lastName: string, email: string, phone: string, programApplied: string, classApplied: string, dateApplied: bigint, status: string, notes: Notes): Promise<string>;
    updateApplicantStatus(id: string, status: string): Promise<void>;
    updateClass(id: Identifier, name: Name, teacherId: Identifier, subjects: Subjects): Promise<Identifier>;
    updateExpense(id: string, category: string, description: string, amount: bigint, date: bigint, approvedBy: string): Promise<string>;
    updateFeeStructure(id: string, name: string, description: string, amount: bigint, gradeLevel: GradeLevel, academicYear: string, feeType: string, feeTypeLabel: string, isActive: IsActive): Promise<string>;
    updatePayment(id: string, invoiceId: string, studentId: Identifier, amount: bigint, paymentDate: bigint, method: string, notes: string): Promise<string>;
    updateStaff(id: Identifier, firstName: string, lastName: string, position: Position, departmentId: DepartmentId, employmentType: EmploymentType, salary: Salary, contactEmail: ContactEmail, contactPhone: ContactPhone, hireDate: HireDate, isActive: IsActive): Promise<Identifier>;
    updateStudent(id: Identifier, firstName: string, lastName: string, grade: Grade, contactEmail: ContactEmail, contactPhone: ContactPhone, parentName: ParentName, enrollmentDate: EnrollmentDate, dob: bigint | null, isActive: IsActive): Promise<Identifier>;
    updateStudentInvoice(id: string, studentId: Identifier, feeStructureId: string, amount: bigint, dueDate: bigint, status: string, issuedDate: bigint): Promise<string>;
    updateTeacher(id: Identifier, firstName: string, lastName: string, subjects: Subjects, contactEmail: ContactEmail, contactPhone: ContactPhone, dateOfJoin: DateOfJoin, grade: string | null, isActive: IsActive): Promise<Identifier>;
}
