import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type HireDate = bigint;
export type Salary = bigint;
export type Timestamp = bigint;
export type StartDate = bigint;
export type LeaveType = string;
export interface Class {
    id: Identifier;
    subjects: Subjects;
    name: Name;
    teacherId: Identifier;
}
export type AuthorName = string;
export type MaxScore = bigint;
export type DepartmentId = string;
export interface Teacher {
    id: Identifier;
    subjects: Subjects;
    isActive: IsActive;
    contactEmail: ContactEmail;
    lastName: string;
    dateOfJoin: DateOfJoin;
    contactPhone: ContactPhone;
    firstName: string;
}
export type Remarks = string;
export type EnrollmentDate = bigint;
export type Instructions = string;
export type Grade = bigint;
export interface Course {
    id: string;
    title: string;
    subject: string;
    description: string;
    classId: string;
    isActive: boolean;
    teacherId: string;
}
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
export interface Lesson {
    id: Identifier;
    title: Title;
    contentText: ContentText;
    courseId: CourseId;
    orderIndex: OrderIndex;
}
export type Title = string;
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
export interface ResourceLink {
    id: string;
    url: string;
    title: string;
    resourceType: string;
    courseId: string;
}
export type EndDate = bigint;
export type DueDate = bigint;
export type DateOfJoin = bigint;
export interface SchoolProfile {
    motto: string;
    email: string;
    address: string;
    phone: string;
    schoolName: string;
}
export type Subject = string;
export type Identifier = string;
export interface Student {
    id: Identifier;
    isActive: IsActive;
    grade: Grade;
    contactEmail: ContactEmail;
    enrollmentDate: EnrollmentDate;
    lastName: string;
    parentName: ParentName;
    contactPhone: ContactPhone;
    firstName: string;
}
export type CourseId = string;
export type ContactPhone = string;
export type StaffId = string;
export interface AttendanceRecord {
    absentStudents: Array<Identifier>;
    date: bigint;
    classId: Identifier;
    presentStudents: Array<Identifier>;
}
export type ContentText = string;
export interface Assignment {
    id: Identifier;
    title: Title;
    maxScore: MaxScore;
    dueDate: DueDate;
    instructions: Instructions;
    courseId: CourseId;
}
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
export interface Announcement {
    id: string;
    title: Title;
    body: Body;
    authorName: AuthorName;
    timestamp: Timestamp;
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
export type Body = string;
export type ContactEmail = string;
export type Status = string;
export type IsActive = boolean;
export type Reason = string;
export type Subjects = Array<string>;
export interface UserProfile {
    linkedId?: string;
    name: string;
    role: string;
}
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
    approveLeaveRequest(leaveRequestId: Identifier): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAnnouncement(title: Title, body: Body, authorName: AuthorName): Promise<string>;
    createClass(name: Name, teacherId: Identifier, subjects: Subjects): Promise<Identifier>;
    createStaff(firstName: string, lastName: string, position: Position, departmentId: DepartmentId, employmentType: EmploymentType, salary: Salary, contactEmail: ContactEmail, contactPhone: ContactPhone, hireDate: HireDate, isActive: IsActive): Promise<Identifier>;
    createStudent(firstName: string, lastName: string, grade: Grade, contactEmail: ContactEmail, contactPhone: ContactPhone, parentName: ParentName, enrollmentDate: EnrollmentDate, isActive: IsActive): Promise<Identifier>;
    createTeacher(firstName: string, lastName: string, subjects: Subjects, contactEmail: ContactEmail, contactPhone: ContactPhone, dateOfJoin: DateOfJoin, isActive: IsActive): Promise<Identifier>;
    deleteClass(id: Identifier): Promise<void>;
    deleteCourse(id: string): Promise<void>;
    deleteDepartment(id: string): Promise<void>;
    deleteStaff(id: Identifier): Promise<void>;
    deleteStudent(id: Identifier): Promise<void>;
    deleteTeacher(id: Identifier): Promise<void>;
    enrollStudentInClass(classId: Identifier, studentId: Identifier | null): Promise<void>;
    generatePayroll(staffId: string, month: bigint, year: bigint, basicSalary: bigint, allowances: bigint, deductions: bigint, netPay: bigint): Promise<string>;
    getActiveLMSCourses(): Promise<Array<Course>>;
    getActiveStaff(): Promise<Array<Staff>>;
    getActiveStudents(): Promise<Array<Student>>;
    getActiveTeachers(): Promise<Array<Teacher>>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllClasses(): Promise<Array<Class>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllDepartments(): Promise<Array<Department>>;
    getAllResourceLinks(): Promise<Array<ResourceLink>>;
    getAllStaff(): Promise<Array<Staff>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTeachers(): Promise<Array<Teacher>>;
    getAnnouncement(id: string): Promise<Announcement>;
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
    getGrade(gradeId: string): Promise<GradeRecord>;
    getGradesByStudent(studentId: Identifier): Promise<Array<GradeRecord>>;
    getGradesBySubject(subject: Subject): Promise<Array<GradeRecord>>;
    getLeaveRequest(id: Identifier): Promise<LeaveRequest>;
    getLeaveRequestsByStaff(staffId: string): Promise<Array<LeaveRequest>>;
    getLesson(id: Identifier): Promise<Lesson>;
    getLessonsByCourse(courseId: CourseId): Promise<Array<Lesson>>;
    getPayrollRecord(id: string): Promise<PayrollRecord>;
    getPayrollRecordsByStaff(staffId: string): Promise<Array<PayrollRecord>>;
    getPendingLeaveRequests(): Promise<Array<LeaveRequest>>;
    getResourceLinksByCourse(courseId: string): Promise<Array<ResourceLink>>;
    getSchoolProfile(): Promise<SchoolProfile>;
    getStaff(id: Identifier): Promise<Staff>;
    getStudent(id: Identifier): Promise<Student>;
    getStudentsSortedByFirstName(): Promise<Array<Student>>;
    getStudentsSortedByLastName(): Promise<Array<Student>>;
    getSubmission(id: string): Promise<AssignmentSubmission>;
    getSubmissionsByAssignment(assignmentId: Identifier): Promise<Array<AssignmentSubmission>>;
    getSubmissionsByStudent(studentId: Identifier): Promise<Array<AssignmentSubmission>>;
    getTeacher(id: Identifier): Promise<Teacher>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    gradeSubmission(submissionId: string, score: bigint, feedback: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markPayrollAsPaid(payrollId: string): Promise<void>;
    recordAttendance(attendanceInput: AttendanceRecordInput): Promise<string>;
    recordGrade(studentId: Identifier, subject: Subject, term: Term, score: Score, remarks: Remarks): Promise<string>;
    rejectLeaveRequest(leaveRequestId: Identifier): Promise<void>;
    removeStudentFromClass(classId: Identifier, studentId: Identifier): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAssignment(assignmentId: Identifier, studentId: Identifier, submissionText: string): Promise<string>;
    submitLeaveRequest(staffId: StaffId, leaveType: LeaveType, startDate: StartDate, endDate: EndDate, reason: Reason): Promise<Identifier>;
    updateClass(id: Identifier, name: Name, teacherId: Identifier, subjects: Subjects): Promise<Identifier>;
    updateStaff(id: Identifier, firstName: string, lastName: string, position: Position, departmentId: DepartmentId, employmentType: EmploymentType, salary: Salary, contactEmail: ContactEmail, contactPhone: ContactPhone, hireDate: HireDate, isActive: IsActive): Promise<Identifier>;
    updateStudent(id: Identifier, firstName: string, lastName: string, grade: Grade, contactEmail: ContactEmail, contactPhone: ContactPhone, parentName: ParentName, enrollmentDate: EnrollmentDate, isActive: IsActive): Promise<Identifier>;
    updateTeacher(id: Identifier, firstName: string, lastName: string, subjects: Subjects, contactEmail: ContactEmail, contactPhone: ContactPhone, dateOfJoin: DateOfJoin, isActive: IsActive): Promise<Identifier>;
}
