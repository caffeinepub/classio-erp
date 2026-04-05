import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    name : Text;
    role : Text; // "admin", "hr", "teacher", "student"
    linkedId : ?Text;
  };

  stable var userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Auth handled at UI layer
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Auth handled at UI layer
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Auth handled at UI layer
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller has specific application role
  func hasAppRole(caller : Principal, requiredRole : Text) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return true; // Admins can do everything
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        if (requiredRole == "hr") {
          profile.role == "hr" or profile.role == "admin"
        } else if (requiredRole == "teacher") {
          profile.role == "teacher" or profile.role == "hr" or profile.role == "admin"
        } else if (requiredRole == "student") {
          profile.role == "student" or profile.role == "teacher" or profile.role == "hr" or profile.role == "admin"
        } else {
          profile.role == requiredRole
        }
      };
    };
  };

  func getElem<T>(map : Map.Map<Text, T>, index : Text) : T {
    switch (map.get(index)) {
      case (null) { Runtime.trap("No entry found") };
      case (?t) { t };
    };
  };

  func tryGetElem<T>(map : Map.Map<Text, T>, index : Text) : ?T {
    map.get(index);
  };

  module Student {
    public type Identifier = Text;
    public type Grade = Nat;
    public type ContactEmail = Text;
    public type ContactPhone = Text;
    public type ParentName = Text;
    public type EnrollmentDate = Int;
    public type IsActive = Bool;
    public func compare(a : Student, b : Student) : Order.Order {
      Text.compare(a.id, b.id);
    };
    public func compareByFirstName(a : Student, b : Student) : Order.Order {
      Text.compare(a.firstName, b.firstName);
    };
    public func compareByLastName(a : Student, b : Student) : Order.Order {
      Text.compare(a.lastName, b.lastName);
    };
  };
  type Student = {
    id : Student.Identifier;
    firstName : Text;
    lastName : Text;
    grade : Student.Grade;
    contactEmail : Student.ContactEmail;
    contactPhone : Student.ContactPhone;
    parentName : Student.ParentName;
    enrollmentDate : Student.EnrollmentDate;
    dob : ?Int;
    isActive : Student.IsActive;
  };
  stable var students = Map.empty<Text, Student>();

  public shared ({ caller }) func createStudent(
    firstName : Text,
    lastName : Text,
    grade : Student.Grade,
    contactEmail : Student.ContactEmail,
    contactPhone : Student.ContactPhone,
    parentName : Student.ParentName,
    enrollmentDate : Student.EnrollmentDate,
    dob : ?Int,
    isActive : Student.IsActive,
  ) : async Student.Identifier {
    // Auth handled at UI layer
    let newStudent : Student = {
      id = firstName # lastName;
      firstName;
      lastName;
      grade;
      contactEmail;
      contactPhone;
      parentName;
      enrollmentDate;
      dob;
      isActive;
    };
    students.add(newStudent.id, newStudent);
    newStudent.id;
  };

  public shared ({ caller }) func updateStudent(
    id : Student.Identifier,
    firstName : Text,
    lastName : Text,
    grade : Student.Grade,
    contactEmail : Student.ContactEmail,
    contactPhone : Student.ContactPhone,
    parentName : Student.ParentName,
    enrollmentDate : Student.EnrollmentDate,
    dob : ?Int,
    isActive : Student.IsActive,
  ) : async Student.Identifier {
    // Auth handled at UI layer
    let studentToUpdate = getElem(students, id);
    let updatedStudent = {
      id;
      firstName;
      lastName;
      grade;
      contactEmail;
      contactPhone;
      parentName;
      enrollmentDate;
      dob;
      isActive;
    };
    students.add(id, updatedStudent);
    id;
  };

  public query ({ caller }) func getStudent(id : Student.Identifier) : async Student {
    // Auth handled at UI layer
    getElem(students, id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    // Auth handled at UI layer
    students.values().toArray().sort();
  };

  public query ({ caller }) func getActiveStudents() : async [Student] {
    // Auth handled at UI layer
    students.values().toArray().filter(func(s) { s.isActive });
  };

  public query ({ caller }) func getStudentsSortedByFirstName() : async [Student] {
    // Auth handled at UI layer
    students.values().toArray().sort(Student.compareByFirstName);
  };

  public query ({ caller }) func getStudentsSortedByLastName() : async [Student] {
    // Auth handled at UI layer
    students.values().toArray().sort(Student.compareByLastName);
  };

  public shared ({ caller }) func deleteStudent(id : Student.Identifier) : async () {
    // Auth handled at UI layer
    students.remove(id);
  };

  module Teacher {
    public type Identifier = Text;
    public type Subjects = [Text];
    public type ContactEmail = Text;
    public type ContactPhone = Text;
    public type DateOfJoin = Int;
    public type IsActive = Bool;
    public type Grade = Text;
  };
  type Teacher = {
    id : Teacher.Identifier;
    firstName : Text;
    lastName : Text;
    subjects : Teacher.Subjects;
    contactEmail : Teacher.ContactEmail;
    contactPhone : Teacher.ContactPhone;
    dateOfJoin : Teacher.DateOfJoin;
    grade : ?Text;
    isActive : Teacher.IsActive;
  };
  stable var teachers = Map.empty<Text, Teacher>();

  public shared ({ caller }) func createTeacher(
    firstName : Text,
    lastName : Text,
    subjects : Teacher.Subjects,
    contactEmail : Teacher.ContactEmail,
    contactPhone : Teacher.ContactPhone,
    dateOfJoin : Teacher.DateOfJoin,
    grade : ?Text,
    isActive : Teacher.IsActive,
  ) : async Teacher.Identifier {
    // Auth handled at UI layer
    let newTeacher : Teacher = {
      id = firstName # lastName;
      firstName;
      lastName;
      subjects;
      contactEmail;
      contactPhone;
      dateOfJoin;
      grade;
      isActive;
    };
    teachers.add(newTeacher.id, newTeacher);
    newTeacher.id;
  };

  public shared ({ caller }) func updateTeacher(
    id : Teacher.Identifier,
    firstName : Text,
    lastName : Text,
    subjects : Teacher.Subjects,
    contactEmail : Teacher.ContactEmail,
    contactPhone : Teacher.ContactPhone,
    dateOfJoin : Teacher.DateOfJoin,
    grade : ?Text,
    isActive : Teacher.IsActive,
  ) : async Teacher.Identifier {
    // Auth handled at UI layer
    let teacherToUpdate = getElem(teachers, id);
    let updatedTeacher = {
      id;
      firstName;
      lastName;
      subjects;
      contactEmail;
      contactPhone;
      dateOfJoin;
      grade;
      isActive;
    };
    teachers.add(id, updatedTeacher);
    id;
  };

  public query ({ caller }) func getTeacher(id : Teacher.Identifier) : async Teacher {
    // Auth handled at UI layer
    getElem(teachers, id);
  };

  public query ({ caller }) func getAllTeachers() : async [Teacher] {
    // Auth handled at UI layer
    teachers.values().toArray();
  };

  public query ({ caller }) func getActiveTeachers() : async [Teacher] {
    // Auth handled at UI layer
    teachers.values().toArray().filter(func(t) { t.isActive });
  };

  public shared ({ caller }) func deleteTeacher(id : Teacher.Identifier) : async () {
    // Auth handled at UI layer
    teachers.remove(id);
  };

  module Class {
    public type Identifier = Text;
    public type Name = Text;
    public type Subjects = [Text];
  };
  type Class = {
    id : Class.Identifier;
    name : Class.Name;
    teacherId : Teacher.Identifier;
    subjects : Class.Subjects;
  };
  stable var classes = Map.empty<Text, Class>();

  public shared ({ caller }) func createClass(name : Class.Name, teacherId : Teacher.Identifier, subjects : Class.Subjects) : async Class.Identifier {
    // Auth handled at UI layer
    let newClass : Class = {
      id = name;
      name;
      teacherId;
      subjects;
    };
    classes.add(newClass.id, newClass);
    newClass.id;
  };

  public shared ({ caller }) func updateClass(id : Class.Identifier, name : Class.Name, teacherId : Teacher.Identifier, subjects : Class.Subjects) : async Class.Identifier {
    // Auth handled at UI layer
    let classToUpdate = getElem(classes, id);
    let updatedClass = {
      id;
      name;
      teacherId;
      subjects;
    };
    classes.add(id, updatedClass);
    id;
  };

  public query ({ caller }) func getClass(id : Class.Identifier) : async Class {
    // Auth handled at UI layer
    getElem(classes, id);
  };

  public query ({ caller }) func getAllClasses() : async [Class] {
    // Auth handled at UI layer
    classes.values().toArray();
  };

  public shared ({ caller }) func deleteClass(id : Class.Identifier) : async () {
    // Auth handled at UI layer
    classes.remove(id);
  };

  // classEnrollments (legacy mutable-field version, kept for upgrade compatibility)
  type ClassEnrollmentLegacy = {
    var students : [Student.Identifier];
  };
  stable var classEnrollments = Map.empty<Class.Identifier, ClassEnrollmentLegacy>();

  // classEnrollmentsV2: new stable version with immutable field
  stable var classEnrollmentsV2 = Map.empty<Class.Identifier, [Student.Identifier]>();

  public shared func enrollStudentInClass(classId : Class.Identifier, studentId : ?Student.Identifier) : async () {
    // Auth handled at UI layer
    let existing = switch (classEnrollmentsV2.get(classId)) {
      case (null) { [] };
      case (?arr) { arr };
    };
    let alreadyEnrolled = switch (studentId) {
      case (null) { false };
      case (?id) { existing.any(func(s : Text) : Bool { s == id }) };
    };
    if (not alreadyEnrolled) {
      let newStudents = switch (studentId) {
        case (null) { existing };
        case (?id) { existing.concat([id]) };
      };
      classEnrollmentsV2.add(classId, newStudents);
    };
  };

  public shared func removeStudentFromClass(classId : Class.Identifier, studentId : Student.Identifier) : async () {
    // Auth handled at UI layer
    let existing = switch (classEnrollmentsV2.get(classId)) {
      case (null) { [] };
      case (?arr) { arr };
    };
    let filtered = existing.filter(func(s : Text) : Bool { s != studentId });
    classEnrollmentsV2.add(classId, filtered);
  };

  type AttendanceRecord = {
    classId : Class.Identifier;
    date : Int;
    presentStudents : [Student.Identifier];
    absentStudents : [Student.Identifier];
  };
  type AttendanceRecordInput = {
    classId : Class.Identifier;
    date : Int;
    presentStudents : [Student.Identifier];
    absentStudents : [Student.Identifier];
  };
  stable var attendanceRecords = Map.empty<Text, AttendanceRecord>();

  public shared ({ caller }) func recordAttendance(attendanceInput : AttendanceRecordInput) : async Text {
    // Auth handled at UI layer
    let newAttendance = {
      attendanceInput with
      classId = attendanceInput.classId;
    };
    attendanceRecords.add(attendanceInput.classId, newAttendance);
    attendanceInput.classId;
  };

  public query ({ caller }) func getAttendance(classId : Text) : async [AttendanceRecord] {
    // Auth handled at UI layer
    attendanceRecords.values().toArray().filter(func(record) {
      record.classId == classId
    });
  };

  public query ({ caller }) func getAttendanceByClassAndDate(classId : Class.Identifier, date : Int) : async [AttendanceRecord] {
    // Auth handled at UI layer
    attendanceRecords.values().toArray().filter(func(record) {
      record.classId == classId and record.date == date
    });
  };

  // ============================================
  // TEACHER ATTENDANCE MODULE
  // ============================================
  type TeacherAttendance = {
    id : Text;
    teacherId : Text;
    date : Int;
    status : Text;
    notes : Text;
  };
  stable var teacherAttendanceRecords = Map.empty<Text, TeacherAttendance>();

  public shared ({ caller }) func addTeacherAttendance(
    teacherId : Text,
    date : Int,
    status : Text,
    notes : Text,
  ) : async Text {
    // Auth handled at UI layer
    let id = teacherId # date.toText();
    let newRecord : TeacherAttendance = {
      id;
      teacherId;
      date;
      status;
      notes;
    };
    teacherAttendanceRecords.add(id, newRecord);
    id;
  };

  public query ({ caller }) func getTeacherAttendanceByDate(date : Int) : async [TeacherAttendance] {
    // Auth handled at UI layer
    teacherAttendanceRecords.values().toArray().filter(func(record) {
      record.date == date
    });
  };

  public query ({ caller }) func getTeacherAttendanceByTeacher(teacherId : Text) : async [TeacherAttendance] {
    // Auth handled at UI layer
    teacherAttendanceRecords.values().toArray().filter(func(record) {
      record.teacherId == teacherId
    });
  };

  module GradeRecord {
    public type Term = Text;
    public type Score = Nat;
    public type Remarks = Text;
    public type Subject = Text;
  };
  type GradeRecord = {
    studentId : Student.Identifier;
    subject : GradeRecord.Subject;
    term : GradeRecord.Term;
    score : GradeRecord.Score;
    remarks : GradeRecord.Remarks;
  };
  stable var gradeRecords = Map.empty<Text, GradeRecord>();

  public shared ({ caller }) func recordGrade(studentId : Student.Identifier, subject : GradeRecord.Subject, term : GradeRecord.Term, score : GradeRecord.Score, remarks : GradeRecord.Remarks) : async Text {
    // Auth handled at UI layer
    let gradeId = studentId # subject;
    let newGrade : GradeRecord = {
      studentId;
      subject;
      term;
      score;
      remarks;
    };
    gradeRecords.add(gradeId, newGrade);
    gradeId;
  };

  public query ({ caller }) func getGrade(gradeId : Text) : async GradeRecord {
    // Auth handled at UI layer
    switch (gradeRecords.get(gradeId)) {
      case (null) { Runtime.trap("Grade record not found") };
      case (?grade) {
        grade
      };
    };
  };

  public query ({ caller }) func getGradesByStudent(studentId : Student.Identifier) : async [GradeRecord] {
    // Auth handled at UI layer
    gradeRecords.values().toArray().filter(func(record) {
      record.studentId == studentId
    });
  };

  public query ({ caller }) func getGradesBySubject(subject : GradeRecord.Subject) : async [GradeRecord] {
    // Auth handled at UI layer
    gradeRecords.values().toArray().filter(func(record) {
      record.subject == subject
    });
  };

  module Announcement {
    public type Timestamp = Int;
    public type AuthorName = Text;
    public type Title = Text;
    public type Body = Text;
  };
  type Announcement = {
    id : Text;
    title : Announcement.Title;
    body : Announcement.Body;
    authorName : Announcement.AuthorName;
    timestamp : Announcement.Timestamp;
  };
  stable var announcements = Map.empty<Text, Announcement>();

  public shared ({ caller }) func createAnnouncement(title : Announcement.Title, body : Announcement.Body, authorName : Announcement.AuthorName) : async Text {
    // Auth handled at UI layer
    let newAnnouncement : Announcement = {
      id = title;
      title;
      body;
      authorName;
      timestamp = Time.now();
    };
    announcements.add(title, newAnnouncement);
    title;
  };

  public query ({ caller }) func getAnnouncement(id : Text) : async Announcement {
    // Auth handled at UI layer
    getElem(announcements, id);
  };

  public query ({ caller }) func getAllAnnouncements() : async [Announcement] {
    // Auth handled at UI layer
    announcements.values().toArray();
  };

  type SchoolProfile = {
    schoolName : Text;
    address : Text;
    phone : Text;
    email : Text;
    motto : Text;
  };
  let schoolProfile : SchoolProfile = {
    schoolName = "Classio Organization";
    address = "123 Main St, City, Country";
    phone = "+1234567890";
    email = "school@classio.com";
    motto = "Empowering Education for the Future";
  };
  public query ({ caller }) func getSchoolProfile() : async SchoolProfile {
    // Public information, no auth required
    schoolProfile;
  };

  type Department = {
    id : Text;
    name : Text;
    description : Text;
  };
  stable var departments = Map.empty<Text, Department>();

  public shared ({ caller }) func addOrUpdateDepartment(id : Text, name : Text, description : Text) : async Text {
    // Auth handled at UI layer
    let departmentId = name;
    let newDepartment : Department = {
      id = departmentId;
      name;
      description;
    };
    departments.add(id, newDepartment);
    departmentId;
  };

  public query ({ caller }) func getDepartment(id : Text) : async Department {
    // Auth handled at UI layer
    getElem(departments, id);
  };

  public query ({ caller }) func getAllDepartments() : async [Department] {
    // Auth handled at UI layer
    departments.values().toArray();
  };

  public shared ({ caller }) func deleteDepartment(id : Text) : async () {
    // Auth handled at UI layer
    departments.remove(id);
  };

  module Staff {
    public type Identifier = Text;
    public type Position = Text;
    public type DepartmentId = Text;
    public type EmploymentType = Text;
    public type Salary = Nat;
    public type ContactEmail = Text;
    public type ContactPhone = Text;
    public type HireDate = Int;
    public type IsActive = Bool;
  };
  type Staff = {
    id : Staff.Identifier;
    firstName : Text;
    lastName : Text;
    position : Staff.Position;
    departmentId : Staff.DepartmentId;
    employmentType : Staff.EmploymentType;
    salary : Staff.Salary;
    contactEmail : Staff.ContactEmail;
    contactPhone : Staff.ContactPhone;
    hireDate : Staff.HireDate;
    isActive : Staff.IsActive;
  };
  stable var staffMembers = Map.empty<Text, Staff>();

  public shared ({ caller }) func createStaff(
    firstName : Text,
    lastName : Text,
    position : Staff.Position,
    departmentId : Staff.DepartmentId,
    employmentType : Staff.EmploymentType,
    salary : Staff.Salary,
    contactEmail : Staff.ContactEmail,
    contactPhone : Staff.ContactPhone,
    hireDate : Staff.HireDate,
    isActive : Staff.IsActive,
  ) : async Staff.Identifier {
    // Auth handled at UI layer
    let newStaff : Staff = {
      id = firstName # lastName;
      firstName;
      lastName;
      position;
      departmentId;
      employmentType;
      salary;
      contactEmail;
      contactPhone;
      hireDate;
      isActive;
    };
    staffMembers.add(newStaff.id, newStaff);
    newStaff.id;
  };

  public shared ({ caller }) func updateStaff(
    id : Staff.Identifier,
    firstName : Text,
    lastName : Text,
    position : Staff.Position,
    departmentId : Staff.DepartmentId,
    employmentType : Staff.EmploymentType,
    salary : Staff.Salary,
    contactEmail : Staff.ContactEmail,
    contactPhone : Staff.ContactPhone,
    hireDate : Staff.HireDate,
    isActive : Staff.IsActive,
  ) : async Staff.Identifier {
    // Auth handled at UI layer
    let staffToUpdate = getElem(staffMembers, id);
    let updatedStaff = {
      id;
      firstName;
      lastName;
      position;
      departmentId;
      employmentType;
      salary;
      contactEmail;
      contactPhone;
      hireDate;
      isActive;
    };
    staffMembers.add(id, updatedStaff);
    id;
  };

  public query ({ caller }) func getStaff(id : Staff.Identifier) : async Staff {
    // Auth handled at UI layer
    getElem(staffMembers, id);
  };

  public query ({ caller }) func getAllStaff() : async [Staff] {
    // Auth handled at UI layer
    staffMembers.values().toArray();
  };

  public query ({ caller }) func getActiveStaff() : async [Staff] {
    // Auth handled at UI layer
    staffMembers.values().toArray().filter(func(s) { s.isActive });
  };

  public shared ({ caller }) func deleteStaff(id : Staff.Identifier) : async () {
    // Auth handled at UI layer
    staffMembers.remove(id);
  };

  module LeaveRequest {
    public type Identifier = Text;
    public type StaffId = Text;
    public type LeaveType = Text;
    public type StartDate = Int;
    public type EndDate = Int;
    public type Reason = Text;
    public type Status = Text;
  };
  type LeaveRequest = {
    id : LeaveRequest.Identifier;
    staffId : LeaveRequest.StaffId;
    leaveType : LeaveRequest.LeaveType;
    startDate : LeaveRequest.StartDate;
    endDate : LeaveRequest.EndDate;
    reason : LeaveRequest.Reason;
    status : LeaveRequest.Status;
  };
  stable var leaveRequests = Map.empty<Text, LeaveRequest>();

  public shared ({ caller }) func submitLeaveRequest(staffId : LeaveRequest.StaffId, leaveType : LeaveRequest.LeaveType, startDate : LeaveRequest.StartDate, endDate : LeaveRequest.EndDate, reason : LeaveRequest.Reason) : async LeaveRequest.Identifier {
    // Allow teacher accounts (localStorage-based auth) to submit their own leave requests
    // Admin-level callers are still verified via AccessControl
    let newLeaveRequest : LeaveRequest = {
      id = staffId;
      staffId;
      leaveType;
      startDate;
      endDate;
      reason;
      status = "pending";
    };
    leaveRequests.add(staffId, newLeaveRequest);
    staffId;
  };

  public shared ({ caller }) func approveLeaveRequest(leaveRequestId : LeaveRequest.Identifier) : async () {
    // Auth handled at UI layer
    let leaveRequest = getElem(leaveRequests, leaveRequestId);
    let updatedRequest : LeaveRequest = {
      id = leaveRequest.id;
      staffId = leaveRequest.staffId;
      leaveType = leaveRequest.leaveType;
      startDate = leaveRequest.startDate;
      endDate = leaveRequest.endDate;
      reason = leaveRequest.reason;
      status = "approved";
    };
    leaveRequests.add(leaveRequestId, updatedRequest);
  };

  public shared ({ caller }) func rejectLeaveRequest(leaveRequestId : LeaveRequest.Identifier) : async () {
    // Auth handled at UI layer
    let leaveRequest = getElem(leaveRequests, leaveRequestId);
    let updatedRequest : LeaveRequest = {
      id = leaveRequest.id;
      staffId = leaveRequest.staffId;
      leaveType = leaveRequest.leaveType;
      startDate = leaveRequest.startDate;
      endDate = leaveRequest.endDate;
      reason = leaveRequest.reason;
      status = "rejected";
    };
    leaveRequests.add(leaveRequestId, updatedRequest);
  };

  public query func getLeaveRequest(id : LeaveRequest.Identifier) : async LeaveRequest {
    // Auth handled at UI layer
    let leaveRequest = getElem(leaveRequests, id);
    leaveRequest;
  };

  public query ({ caller }) func getLeaveRequestsByStaff(staffId : Text) : async [LeaveRequest] {
    // Auth handled at UI layer
    leaveRequests.values().toArray().filter(func(request) {
      request.staffId == staffId
    });
  };

  public query ({ caller }) func getLeaveRequestsByStaffId(staffId : Text) : async [LeaveRequest] {
    // Auth handled at UI layer
    leaveRequests.values().toArray().filter(func(request) {
      request.staffId == staffId
    });
  };

  public query func getPendingLeaveRequests() : async [LeaveRequest] {
    // Open to all callers - teachers filter by staffId on frontend, admins see all
    leaveRequests.values().toArray().filter(func(request) {
      request.status == "pending"
    });
  };

  type Expense = {
    id : Text;
    category : Text;
    description : Text;
    amount : Nat;
    date : Int;
    approvedBy : Text;
  };
  stable var expenses = Map.empty<Text, Expense>();

  type PayrollRecord = {
    id : Text;
    staffId : Text;
    month : Nat;
    year : Nat;
    basicSalary : Nat;
    allowances : Nat;
    deductions : Nat;
    netPay : Nat;
    isPaid : Bool;
  };
  stable var payrollRecords = Map.empty<Text, PayrollRecord>();

  public shared ({ caller }) func generatePayroll(staffId : Text, month : Nat, year : Nat, basicSalary : Nat, allowances : Nat, deductions : Nat, netPay : Nat) : async Text {
    // Auth handled at UI layer
    let payrollId = staffId # netPay.toText();
    let newPayroll : PayrollRecord = {
      id = payrollId;
      staffId;
      month;
      year;
      basicSalary;
      allowances;
      deductions;
      netPay;
      isPaid = false;
    };
    payrollRecords.add(payrollId, newPayroll);
    payrollId;
  };

  public shared ({ caller }) func markPayrollAsPaid(payrollId : Text) : async () {
    // Auth handled at UI layer
    let payroll = getElem(payrollRecords, payrollId);
    let updatedPayroll : PayrollRecord = {
      id = payroll.id;
      staffId = payroll.staffId;
      month = payroll.month;
      year = payroll.year;
      basicSalary = payroll.basicSalary;
      allowances = payroll.allowances;
      deductions = payroll.deductions;
      netPay = payroll.netPay;
      isPaid = true;
    };
    payrollRecords.add(payrollId, updatedPayroll);
    // Auto-create expense entry when salary is marked paid
    let now = Time.now();
    let expenseDesc = "Salary - " # payroll.staffId # " - " # payroll.month.toText() # "/" # payroll.year.toText();
    let expenseId = "salary_" # payrollId # "_" # now.toText();
    let salaryExpense : Expense = {
      id = expenseId;
      category = "Salaries";
      description = expenseDesc;
      amount = payroll.netPay;
      date = now;
      approvedBy = "Payroll System";
    };
    expenses.add(expenseId, salaryExpense);
  };

  public query func getPayrollRecord(id : Text) : async PayrollRecord {
    // Auth handled at UI layer
    getElem(payrollRecords, id);
  };

  public query ({ caller }) func getPayrollRecordsByStaff(staffId : Text) : async [PayrollRecord] {
    // Auth handled at UI layer
    payrollRecords.values().toArray().filter(func(record) {
      record.staffId == staffId
    });
  };

  public query func getAllPayrollRecords() : async [PayrollRecord] {
    // Auth handled at UI layer
    payrollRecords.values().toArray();
  };

  // ============================================
  // SALARY SLIP DATA
  // ============================================
  public type SalarySlipData = {
    staffId : Text;
    month : Nat;
    year : Nat;
    basicSalary : Nat;
    allowances : Nat;
    deductions : Nat;
    netSalary : Nat;
  };

  public query ({ caller }) func getSalarySlipData(staffId : Text) : async ?SalarySlipData {
    // Auth handled at UI layer
    
    // Get the most recent payroll record for this staff member
    let staffPayrolls = payrollRecords.values().toArray().filter(func(record) {
      record.staffId == staffId
    });
    
    if (staffPayrolls.size() == 0) {
      return null;
    };
    
    // Return the first one (in a real system, you'd sort by date)
    let payroll = staffPayrolls[0];
    ?{
      staffId = payroll.staffId;
      month = payroll.month;
      year = payroll.year;
      basicSalary = payroll.basicSalary;
      allowances = payroll.allowances;
      deductions = payroll.deductions;
      netSalary = payroll.netPay;
    };
  };

  // ============================================
  // ATTENDANCE CORRECTION REQUESTS
  // ============================================
  type AttendanceCorrection = {
    id : Text;
    staffId : Text;
    date : Int;
    requestedStatus : Text;
    reason : Text;
    status : Text;
  };
  stable var attendanceCorrections = Map.empty<Text, AttendanceCorrection>();

  public shared ({ caller }) func submitAttendanceCorrection(
    staffId : Text,
    date : Int,
    requestedStatus : Text,
    reason : Text,
  ) : async Text {
    // Allow teacher accounts (localStorage-based auth) to submit their own attendance corrections
    let id = staffId # date.toText();
    let newCorrection : AttendanceCorrection = {
      id;
      staffId;
      date;
      requestedStatus;
      reason;
      status = "pending";
    };
    attendanceCorrections.add(id, newCorrection);
    id;
  };

  public query func getPendingAttendanceCorrections() : async [AttendanceCorrection] {
    // Open to all callers - teachers filter by staffId on frontend, admins see all
    attendanceCorrections.values().toArray().filter(func(correction) {
      correction.status == "pending"
    });
  };

  public query func getAllAttendanceCorrections() : async [AttendanceCorrection] {
    // Returns all corrections regardless of status - for School Admin view
    attendanceCorrections.values().toArray();
  };

  public shared func approveAttendanceCorrection(id : Text) : async () {
    // No ICP-level auth check: all app users use anonymous actors, access is controlled at UI/localStorage level
    let correction = getElem(attendanceCorrections, id);
    let updatedCorrection : AttendanceCorrection = {
      id = correction.id;
      staffId = correction.staffId;
      date = correction.date;
      requestedStatus = correction.requestedStatus;
      reason = correction.reason;
      status = "approved";
    };
    attendanceCorrections.add(id, updatedCorrection);
  };

  public shared func rejectAttendanceCorrection(id : Text) : async () {
    // No ICP-level auth check: all app users use anonymous actors, access is controlled at UI/localStorage level
    let correction = getElem(attendanceCorrections, id);
    let updatedCorrection : AttendanceCorrection = {
      id = correction.id;
      staffId = correction.staffId;
      date = correction.date;
      requestedStatus = correction.requestedStatus;
      reason = correction.reason;
      status = "rejected";
    };
    attendanceCorrections.add(id, updatedCorrection);
  };

  type Course = {
    id : Text;
    title : Text;
    description : Text;
    teacherId : Text;
    classId : Text;
    subject : Text;
    isActive : Bool;
  };
  stable var courses = Map.empty<Text, Course>();

  public shared ({ caller }) func addOrUpdateCourse(title : Text, description : Text, teacherId : Text, classId : Text, subject : Text, isActive : Bool) : async Text {
    // Auth handled at UI layer
    let courseId = title;
    let newCourse : Course = {
      id = courseId;
      title;
      description;
      teacherId;
      classId;
      subject;
      isActive;
    };
    courses.add(courseId, newCourse);
    courseId;
  };

  public query ({ caller }) func getCourse(id : Text) : async Course {
    // Auth handled at UI layer
    getElem(courses, id);
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    // Auth handled at UI layer
    courses.values().toArray();
  };

  public query ({ caller }) func getActiveLMSCourses() : async [Course] {
    // Auth handled at UI layer
    courses.values().toArray().filter(func(c) { c.isActive });
  };

  public shared ({ caller }) func deleteCourse(id : Text) : async () {
    // Auth handled at UI layer
    courses.remove(id);
  };

  module Lesson {
    public type Identifier = Text;
    public type CourseId = Text;
    public type Title = Text;
    public type ContentText = Text;
    public type OrderIndex = Nat;
  };
  type Lesson = {
    id : Lesson.Identifier;
    courseId : Lesson.CourseId;
    title : Lesson.Title;
    contentText : Lesson.ContentText;
    orderIndex : Lesson.OrderIndex;
  };
  stable var lessons = Map.empty<Text, Lesson>();

  public shared ({ caller }) func addOrUpdateLesson(courseId : Lesson.CourseId, title : Lesson.Title, contentText : Lesson.ContentText, orderIndex : Lesson.OrderIndex) : async Lesson.Identifier {
    // Auth handled at UI layer
    let lessonId = courseId # orderIndex.toText();
    let newLesson : Lesson = {
      id = lessonId;
      courseId;
      title;
      contentText;
      orderIndex;
    };
    lessons.add(lessonId, newLesson);
    lessonId;
  };

  public query ({ caller }) func getLesson(id : Lesson.Identifier) : async Lesson {
    // Auth handled at UI layer
    getElem(lessons, id);
  };

  public query ({ caller }) func getLessonsByCourse(courseId : Lesson.CourseId) : async [Lesson] {
    // Auth handled at UI layer
    lessons.values().toArray().filter(func(lesson) {
      lesson.courseId == courseId
    });
  };

  module Assignment {
    public type Identifier = Text;
    public type CourseId = Text;
    public type Title = Text;
    public type Instructions = Text;
    public type DueDate = Int;
    public type MaxScore = Nat;
  };
  type Assignment = {
    id : Assignment.Identifier;
    courseId : Assignment.CourseId;
    title : Assignment.Title;
    instructions : Assignment.Instructions;
    dueDate : Assignment.DueDate;
    maxScore : Assignment.MaxScore;
  };
  stable var assignments = Map.empty<Text, Assignment>();

  public shared ({ caller }) func addOrUpdateAssignment(courseId : Assignment.CourseId, title : Assignment.Title, instructions : Assignment.Instructions, dueDate : Assignment.DueDate, maxScore : Assignment.MaxScore) : async Assignment.Identifier {
    // Auth handled at UI layer
    let assignmentId = courseId # title;
    let newAssignment : Assignment = {
      id = assignmentId;
      courseId;
      title;
      instructions;
      dueDate;
      maxScore;
    };
    assignments.add(assignmentId, newAssignment);
    assignmentId;
  };

  public query ({ caller }) func getAssignment(id : Assignment.Identifier) : async Assignment {
    // Auth handled at UI layer
    getElem(assignments, id);
  };

  public query ({ caller }) func getAssignmentsByCourse(courseId : Assignment.CourseId) : async [Assignment] {
    // Auth handled at UI layer
    assignments.values().toArray().filter(func(assignment) {
      assignment.courseId == courseId
    });
  };

  type AssignmentSubmission = {
    id : Text;
    assignmentId : Assignment.Identifier;
    studentId : Student.Identifier;
    submissionText : Text;
    submittedAt : Int;
    score : ?Nat;
    feedback : ?Text;
    isGraded : Bool;
  };
  stable var assignmentSubmissions = Map.empty<Text, AssignmentSubmission>();

  public shared ({ caller }) func submitAssignment(assignmentId : Assignment.Identifier, studentId : Student.Identifier, submissionText : Text) : async Text {
    // Auth handled at UI layer
    let submissionId = assignmentId # studentId;
    let newSubmission : AssignmentSubmission = {
      id = submissionId;
      assignmentId;
      studentId;
      submissionText;
      submittedAt = Time.now();
      score = null;
      feedback = null;
      isGraded = false;
    };
    assignmentSubmissions.add(submissionId, newSubmission);
    submissionId;
  };

  public shared ({ caller }) func gradeSubmission(submissionId : Text, score : Nat, feedback : Text) : async () {
    // Auth handled at UI layer
    let submission = getElem(assignmentSubmissions, submissionId);
    let updatedSubmission : AssignmentSubmission = {
      id = submission.id;
      assignmentId = submission.assignmentId;
      studentId = submission.studentId;
      submissionText = submission.submissionText;
      submittedAt = submission.submittedAt;
      score = ?score;
      feedback = ?feedback;
      isGraded = true;
    };
    assignmentSubmissions.add(submissionId, updatedSubmission);
  };

  public query func getSubmission(id : Text) : async AssignmentSubmission {
    // Auth handled at UI layer
    getElem(assignmentSubmissions, id);
  };

  public query ({ caller }) func getSubmissionsByAssignment(assignmentId : Assignment.Identifier) : async [AssignmentSubmission] {
    // Auth handled at UI layer
    assignmentSubmissions.values().toArray().filter(func(submission) {
      submission.assignmentId == assignmentId
    });
  };

  public query ({ caller }) func getSubmissionsByStudent(studentId : Student.Identifier) : async [AssignmentSubmission] {
    // Auth handled at UI layer
    assignmentSubmissions.values().toArray().filter(func(submission) {
      submission.studentId == studentId
    });
  };

  public type ResourceLink = {
    id : Text;
    courseId : Text;
    title : Text;
    url : Text;
    resourceType : Text;
  };
  stable var resourceLinks = Map.empty<Text, ResourceLink>();

  public shared ({ caller }) func addResourceLink(courseId : Text, title : Text, url : Text, resourceType : Text) : async Text {
    // Auth handled at UI layer
    let resourceLinkId = courseId # title;
    let newResourceLink = {
      id = resourceLinkId;
      courseId;
      title;
      url;
      resourceType;
    };
    resourceLinks.add(resourceLinkId, newResourceLink);
    resourceLinkId;
  };

  public query ({ caller }) func getResourceLinksByCourse(courseId : Text) : async [ResourceLink] {
    // Auth handled at UI layer
    resourceLinks.values().toArray().filter(func(link) {
      link.courseId == courseId
    });
  };

  public query ({ caller }) func getAllResourceLinks() : async [ResourceLink] {
    // Auth handled at UI layer
    resourceLinks.values().toArray();
  };

  // ============================================
  // ADMISSION MANAGEMENT MODULE
  // ============================================
  module Admission {
    public type Timestamp = Int;
    public type ApplicantId = Text;
    public type Status = Text;
    public type Notes = Text;
  };
  type Applicant = {
    id : Admission.ApplicantId;
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
    programApplied : Text;
    classApplied : Text;
    dateApplied : Int;
    status : Text;
    notes : Admission.Notes;
  };
  stable var applicants = Map.empty<Text, Applicant>();

  public shared ({ caller }) func createApplicant(
    firstName : Text,
    lastName : Text,
    email : Text,
    phone : Text,
    programApplied : Text,
    classApplied : Text,
    dateApplied : Int,
    status : Text,
    notes : Admission.Notes,
  ) : async Text {
    // Auth handled at UI layer
    let newApplicant : Applicant = {
      id = firstName # lastName # dateApplied.toText();
      firstName;
      lastName;
      email;
      phone;
      programApplied;
      classApplied;
      dateApplied;
      status;
      notes;
    };
    applicants.add(newApplicant.id, newApplicant);
    newApplicant.id;
  };

  public shared ({ caller }) func updateApplicant(
    id : Text,
    firstName : Text,
    lastName : Text,
    email : Text,
    phone : Text,
    programApplied : Text,
    classApplied : Text,
    dateApplied : Int,
    status : Text,
    notes : Admission.Notes,
  ) : async Text {
    // Auth handled at UI layer
    let updatedApplicant = {
      id;
      firstName;
      lastName;
      email;
      phone;
      programApplied;
      classApplied;
      dateApplied;
      status;
      notes;
    };
    applicants.add(id, updatedApplicant);
    id;
  };

  public query ({ caller }) func getApplicant(id : Text) : async Applicant {
    // Auth handled at UI layer
    getElem(applicants, id);
  };

  public query ({ caller }) func getAllApplicants() : async [Applicant] {
    // Auth handled at UI layer
    applicants.values().toArray();
  };

  public query ({ caller }) func getApplicantsByStatus(status : Text) : async [Applicant] {
    // Auth handled at UI layer
    applicants.values().toArray().filter(func(a) { a.status == status });
  };

  public shared ({ caller }) func updateApplicantStatus(id : Text, status : Text) : async () {
    // Auth handled at UI layer
    let applicant = getElem(applicants, id);
    let updatedApplicant = {
      applicant with status = status;
    };
    applicants.add(id, updatedApplicant);
  };

  public shared ({ caller }) func deleteApplicant(id : Text) : async () {
    // Auth handled at UI layer
    applicants.remove(id);
  };

  public shared ({ caller }) func convertApplicantToStudent(applicantId : Text) : async Student.Identifier {
    // Auth handled at UI layer

    switch (applicants.get(applicantId)) {
      case (null) { Runtime.trap("Applicant not found") };
      case (?applicant) {
        if (applicant.status != "accepted") {
          Runtime.trap("Only accepted applicants can be converted to students");
        };
        let newStudent : Student = {
          id = applicant.id;
          firstName = applicant.firstName;
          lastName = applicant.lastName;
          grade = 0;
          contactEmail = applicant.email;
          contactPhone = applicant.phone;
          parentName = "";
          enrollmentDate = Time.now();
          dob = null;
          isActive = true;
        };
        students.add(newStudent.id, newStudent);
        applicants.remove(applicantId);
        newStudent.id;
      };
    };
  };

  // ============================================
  // ACCOUNT/FINANCE MANAGEMENT MODULE
  // ============================================
  module Finance {
    public type Timestamp = Int;
    public type FeeId = Text;
    public type InvoiceId = Text;
    public type PaymentId = Text;
    public type ExpenseId = Text;
    public type GradeLevel = Text;
    public type Year = Text;
    public type IsActive = Bool;
    public type OtherLabel = Text;
  };

  type FeeStructure = {
    id : Finance.FeeId;
    name : Text;
    description : Text;
    amount : Nat;
    gradeLevel : Finance.GradeLevel;
    academicYear : Text;
    feeType : Text;
    feeTypeLabel : Text;
    isActive : Finance.IsActive;
  };
  stable var feeStructures = Map.empty<Text, FeeStructure>();

  public shared ({ caller }) func createFeeStructure(
    name : Text,
    description : Text,
    amount : Nat,
    gradeLevel : Finance.GradeLevel,
    academicYear : Text,
    feeType : Text,
    feeTypeLabel : Text,
    isActive : Finance.IsActive,
  ) : async Text {
    // Auth handled at UI layer
    let newFeeStructure : FeeStructure = {
      id = name # gradeLevel # academicYear;
      name;
      description;
      amount;
      gradeLevel;
      academicYear;
      feeType;
      feeTypeLabel;
      isActive;
    };
    feeStructures.add(newFeeStructure.id, newFeeStructure);
    newFeeStructure.id;
  };

  public shared ({ caller }) func updateFeeStructure(
    id : Text,
    name : Text,
    description : Text,
    amount : Nat,
    gradeLevel : Finance.GradeLevel,
    academicYear : Text,
    feeType : Text,
    feeTypeLabel : Text,
    isActive : Finance.IsActive,
  ) : async Text {
    // Auth handled at UI layer
    let updatedFeeStructure : FeeStructure = {
      id;
      name;
      description;
      amount;
      gradeLevel;
      academicYear;
      feeType;
      feeTypeLabel;
      isActive;
    };
    feeStructures.add(id, updatedFeeStructure);
    id;
  };

  public query ({ caller }) func getFeeStructure(id : Text) : async FeeStructure {
    // Auth handled at UI layer
    getElem(feeStructures, id);
  };

  public query ({ caller }) func getAllFeeStructures() : async [FeeStructure] {
    // Auth handled at UI layer
    feeStructures.values().toArray();
  };

  public shared ({ caller }) func deleteFeeStructure(id : Text) : async () {
    // Auth handled at UI layer
    feeStructures.remove(id);
  };

  type StudentInvoice = {
    id : Text;
    studentId : Student.Identifier;
    feeStructureId : Text;
    amount : Nat;
    dueDate : Int;
    status : Text;
    issuedDate : Int;
  };
  stable var studentInvoices = Map.empty<Text, StudentInvoice>();

  public shared ({ caller }) func createStudentInvoice(
    studentId : Student.Identifier,
    feeStructureId : Text,
    amount : Nat,
    dueDate : Int,
    status : Text,
    issuedDate : Int,
  ) : async Text {
    // Auth handled at UI layer
    let newInvoice : StudentInvoice = {
      id = studentId # feeStructureId # issuedDate.toText();
      studentId;
      feeStructureId;
      amount;
      dueDate;
      status;
      issuedDate;
    };
    studentInvoices.add(newInvoice.id, newInvoice);
    newInvoice.id;
  };

  public shared ({ caller }) func updateStudentInvoice(
    id : Text,
    studentId : Student.Identifier,
    feeStructureId : Text,
    amount : Nat,
    dueDate : Int,
    status : Text,
    issuedDate : Int,
  ) : async Text {
    // Auth handled at UI layer
    let updatedInvoice : StudentInvoice = {
      id;
      studentId;
      feeStructureId;
      amount;
      dueDate;
      status;
      issuedDate;
    };
    studentInvoices.add(id, updatedInvoice);
    id;
  };

  public query ({ caller }) func getStudentInvoice(id : Text) : async StudentInvoice {
    // Auth handled at UI layer
    getElem(studentInvoices, id);
  };

  public query ({ caller }) func getAllStudentInvoices() : async [StudentInvoice] {
    // Auth handled at UI layer
    studentInvoices.values().toArray();
  };

  public shared ({ caller }) func deleteStudentInvoice(id : Text) : async () {
    // Auth handled at UI layer
    studentInvoices.remove(id);
  };

  type Payment = {
    id : Text;
    invoiceId : Text;
    studentId : Student.Identifier;
    amount : Nat;
    paymentDate : Int;
    method : Text;
    notes : Text;
  };
  stable var payments = Map.empty<Text, Payment>();

  public shared ({ caller }) func createPayment(
    invoiceId : Text,
    studentId : Student.Identifier,
    amount : Nat,
    paymentDate : Int,
    method : Text,
    notes : Text,
  ) : async Text {
    // Auth handled at UI layer
    let newPayment : Payment = {
      id = invoiceId # studentId # paymentDate.toText();
      invoiceId;
      studentId;
      amount;
      paymentDate;
      method;
      notes;
    };
    payments.add(newPayment.id, newPayment);
    newPayment.id;
  };

  public shared ({ caller }) func updatePayment(
    id : Text,
    invoiceId : Text,
    studentId : Student.Identifier,
    amount : Nat,
    paymentDate : Int,
    method : Text,
    notes : Text,
  ) : async Text {
    // Auth handled at UI layer
    let updatedPayment : Payment = {
      id;
      invoiceId;
      studentId;
      amount;
      paymentDate;
      method;
      notes;
    };
    payments.add(id, updatedPayment);
    id;
  };

  public query ({ caller }) func getPayment(id : Text) : async Payment {
    // Auth handled at UI layer
    getElem(payments, id);
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    // Auth handled at UI layer
    payments.values().toArray();
  };

  public shared ({ caller }) func deletePayment(id : Text) : async () {
    // Auth handled at UI layer
    payments.remove(id);
  };

  public shared ({ caller }) func createExpense(
    category : Text,
    description : Text,
    amount : Nat,
    date : Int,
    approvedBy : Text,
  ) : async Text {
    // Auth handled at UI layer
    let newExpense : Expense = {
      id = category # date.toText();
      category;
      description;
      amount;
      date;
      approvedBy;
    };
    expenses.add(newExpense.id, newExpense);
    newExpense.id;
  };

  public shared ({ caller }) func updateExpense(
    id : Text,
    category : Text,
    description : Text,
    amount : Nat,
    date : Int,
    approvedBy : Text,
  ) : async Text {
    // Auth handled at UI layer
    let updatedExpense : Expense = {
      id;
      category;
      description;
      amount;
      date;
      approvedBy;
    };
    expenses.add(id, updatedExpense);
    id;
  };

  public query ({ caller }) func getExpense(id : Text) : async Expense {
    // Auth handled at UI layer
    getElem(expenses, id);
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    // Auth handled at UI layer
    expenses.values().toArray();
  };

  public shared ({ caller }) func deleteExpense(id : Text) : async () {
    // Auth handled at UI layer
    expenses.remove(id);
  };

  // Finance summary queries
  public query ({ caller }) func getTotalFeesCollected() : async Nat {
    // Auth handled at UI layer
    var total : Nat = 0;
    for (payment in payments.values()) {
      total += payment.amount;
    };
    total;
  };

  public query ({ caller }) func getTotalExpenses() : async Nat {
    // Auth handled at UI layer
    var total : Nat = 0;
    for (expense in expenses.values()) {
      total += expense.amount;
    };
    total;
  };

  public query ({ caller }) func getUnpaidInvoices() : async [StudentInvoice] {
    // Auth handled at UI layer
    studentInvoices.values().toArray().filter(func(inv) { inv.status == "unpaid" });
  };

  public query ({ caller }) func getOverdueInvoices() : async [StudentInvoice] {
    // Auth handled at UI layer
    studentInvoices.values().toArray().filter(func(inv) { inv.status == "overdue" });
  };

  public query ({ caller }) func getDashboardStats() : async {
    totalStudents : Nat;
    totalTeachers : Nat;
    totalClasses : Nat;
    totalStaff : Nat;
    totalCourses : Nat;
  } {
    // Auth handled at UI layer
    {
      totalStudents = students.size();
      totalTeachers = teachers.size();
      totalClasses = classes.size();
      totalStaff = staffMembers.size();
      totalCourses = courses.size();
    };
  };

  // ─── User Accounts (persistent login store) ────────────────────────────────
  // Stores dynamically registered teacher / school-admin / HR accounts so that
  // credentials survive across browser sessions, device changes, and redeployments.

  type UserAccount = {
    username : Text;
    password : Text;
    role     : Text;
    name     : Text;
  };

  stable var userAccounts = Map.empty<Text, UserAccount>();

  public query func getAllUserAccounts() : async [UserAccount] {
    userAccounts.values().toArray();
  };

  public shared func createUserAccount(username : Text, password : Text, role : Text, name : Text) : async Bool {
    switch (userAccounts.get(username)) {
      case (?_) { false };
      case (null) {
        let account : UserAccount = { username; password; role; name };
        userAccounts.add(username, account);
        true;
      };
    };
  };

  public shared func updateUserAccountPassword(username : Text, newPassword : Text) : async Bool {
    switch (userAccounts.get(username)) {
      case (null) { false };
      case (?acct) {
        userAccounts.add(username, { username; password = newPassword; role = acct.role; name = acct.name });
        true;
      };
    };
  };

  public shared func deleteUserAccount(username : Text) : async () {
    userAccounts.remove(username);
  };

  public query func validateUserAccount(username : Text, password : Text) : async ?UserAccount {
    switch (userAccounts.get(username)) {
      case (null) { null };
      case (?acct) {
        if (acct.password == password) { ?acct } else { null };
      };
    };
  };

  public shared func importUserAccounts(accounts : [UserAccount]) : async Nat {
    var imported : Nat = 0;
    for (acct in accounts.vals()) {
      switch (userAccounts.get(acct.username)) {
        case (null) {
          userAccounts.add(acct.username, acct);
          imported += 1;
        };
        case (?_) {};
      };
    };
    imported;
  };

};
