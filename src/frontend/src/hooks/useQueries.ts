import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  Assignment,
  AssignmentSubmission,
  AttendanceCorrection,
  AttendanceRecord,
  AttendanceRecordInput,
  Class,
  Course,
  Department,
  GradeRecord,
  LeaveRequest,
  Lesson,
  PayrollRecord,
  ResourceLink,
  SalarySlipData,
  SchoolProfile,
  Staff,
  Student,
  Teacher,
  TeacherAttendance,
  UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Dashboard ──────────────────────────────────────────────────────────────
export function useDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Auth / Profile ─────────────────────────────────────────────────────────
export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerRole"] }),
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

// ── Students ───────────────────────────────────────────────────────────────
export function useAllStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      grade: bigint;
      contactEmail: string;
      contactPhone: string;
      parentName: string;
      enrollmentDate: bigint;
      dob: bigint | null;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStudent(
        data.firstName,
        data.lastName,
        data.grade,
        data.contactEmail,
        data.contactPhone,
        data.parentName,
        data.enrollmentDate,
        data.dob,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      firstName: string;
      lastName: string;
      grade: bigint;
      contactEmail: string;
      contactPhone: string;
      parentName: string;
      enrollmentDate: bigint;
      dob: bigint | null;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudent(
        data.id,
        data.firstName,
        data.lastName,
        data.grade,
        data.contactEmail,
        data.contactPhone,
        data.parentName,
        data.enrollmentDate,
        data.dob,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// ── Teachers ───────────────────────────────────────────────────────────────
export function useAllTeachers() {
  const { actor, isFetching } = useActor();
  return useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTeachers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      subjects: string[];
      contactEmail: string;
      contactPhone: string;
      dateOfJoin: bigint;
      grade: string | null;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTeacher(
        data.firstName,
        data.lastName,
        data.subjects,
        data.contactEmail,
        data.contactPhone,
        data.dateOfJoin,
        data.grade,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useUpdateTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      firstName: string;
      lastName: string;
      subjects: string[];
      contactEmail: string;
      contactPhone: string;
      dateOfJoin: bigint;
      grade: string | null;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTeacher(
        data.id,
        data.firstName,
        data.lastName,
        data.subjects,
        data.contactEmail,
        data.contactPhone,
        data.dateOfJoin,
        data.grade,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

export function useDeleteTeacher() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTeacher(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teachers"] }),
  });
}

// ── Classes ────────────────────────────────────────────────────────────────
export function useAllClasses() {
  const { actor, isFetching } = useActor();
  return useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClasses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      teacherId: string;
      subjects: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createClass(data.name, data.teacherId, data.subjects);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}

export function useUpdateClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      teacherId: string;
      subjects: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateClass(
        data.id,
        data.name,
        data.teacherId,
        data.subjects,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}

export function useDeleteClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteClass(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}

export function useEnrollStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; studentId: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.enrollStudentInClass(data.classId, data.studentId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}

export function useRemoveStudentFromClass() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { classId: string; studentId: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeStudentFromClass(data.classId, data.studentId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}

// ── Attendance ─────────────────────────────────────────────────────────────
export function useAttendanceByClass(classId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendance", classId],
    queryFn: async () => {
      if (!actor || !classId) return [];
      return actor.getAttendance(classId);
    },
    enabled: !!actor && !isFetching && !!classId,
  });
}

export function useRecordAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AttendanceRecordInput) => {
      if (!actor) throw new Error("No actor");
      return actor.recordAttendance(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

// ── Teacher Attendance ─────────────────────────────────────────────────────
export function useTeacherAttendanceByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TeacherAttendance[]>({
    queryKey: ["teacherAttendance", "date", date],
    queryFn: async () => {
      if (!actor || !date) return [];
      const d = new Date(date);
      return actor.getTeacherAttendanceByDate(
        BigInt(d.getTime()) * BigInt(1_000_000),
      );
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useTeacherAttendanceByTeacher(teacherId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<TeacherAttendance[]>({
    queryKey: ["teacherAttendance", "teacher", teacherId],
    queryFn: async () => {
      if (!actor || !teacherId) return [];
      return actor.getTeacherAttendanceByTeacher(teacherId);
    },
    enabled: !!actor && !isFetching && !!teacherId,
  });
}

export function useAddTeacherAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      teacherId: string;
      date: bigint;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTeacherAttendance(
        data.teacherId,
        data.date,
        data.status,
        data.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacherAttendance"] }),
  });
}

// ── Attendance Corrections ─────────────────────────────────────────────────
export function usePendingAttendanceCorrections() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceCorrection[]>({
    queryKey: ["attendanceCorrections", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingAttendanceCorrections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitAttendanceCorrection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      staffId: string;
      date: bigint;
      requestedStatus: string;
      reason: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitAttendanceCorrection(
        data.staffId,
        data.date,
        data.requestedStatus,
        data.reason,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attendanceCorrections"] }),
  });
}

export function useApproveAttendanceCorrection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.approveAttendanceCorrection(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attendanceCorrections"] }),
  });
}

export function useRejectAttendanceCorrection() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectAttendanceCorrection(id);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["attendanceCorrections"] }),
  });
}

// ── Salary Slip ────────────────────────────────────────────────────────────
export function useSalarySlipData(staffId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<SalarySlipData | null>({
    queryKey: ["salarySlip", staffId],
    queryFn: async () => {
      if (!actor || !staffId) return null;
      return actor.getSalarySlipData(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

// ── Grades ─────────────────────────────────────────────────────────────────
export function useGradesByStudent(studentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<GradeRecord[]>({
    queryKey: ["grades", "student", studentId],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getGradesByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useRecordGrade() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentId: string;
      subject: string;
      term: string;
      score: bigint;
      remarks: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.recordGrade(
        data.studentId,
        data.subject,
        data.term,
        data.score,
        data.remarks,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["grades"] }),
  });
}

// ── Announcements ──────────────────────────────────────────────────────────
export function useAllAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; body: string; authorName: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createAnnouncement(data.title, data.body, data.authorName);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
  });
}

// ── School Profile ─────────────────────────────────────────────────────────
export function useSchoolProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<SchoolProfile>({
    queryKey: ["schoolProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getSchoolProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Staff ──────────────────────────────────────────────────────────────────
export function useAllStaff() {
  const { actor, isFetching } = useActor();
  return useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      position: string;
      departmentId: string;
      employmentType: string;
      salary: bigint;
      contactEmail: string;
      contactPhone: string;
      hireDate: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStaff(
        data.firstName,
        data.lastName,
        data.position,
        data.departmentId,
        data.employmentType,
        data.salary,
        data.contactEmail,
        data.contactPhone,
        data.hireDate,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      firstName: string;
      lastName: string;
      position: string;
      departmentId: string;
      employmentType: string;
      salary: bigint;
      contactEmail: string;
      contactPhone: string;
      hireDate: bigint;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStaff(
        data.id,
        data.firstName,
        data.lastName,
        data.position,
        data.departmentId,
        data.employmentType,
        data.salary,
        data.contactEmail,
        data.contactPhone,
        data.hireDate,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStaff(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

// ── Departments ────────────────────────────────────────────────────────────
export function useAllDepartments() {
  const { actor, isFetching } = useActor();
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDepartments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOrUpdateDepartment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; name: string; description: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateDepartment(data.id, data.name, data.description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDepartment(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

// ── HR - Leave Requests ────────────────────────────────────────────────────
export function usePendingLeaveRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingLeaveRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLeaveRequestsByStaff(staffId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests", "staff", staffId],
    queryFn: async () => {
      if (!actor || !staffId) return [];
      return actor.getLeaveRequestsByStaff(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

export function useLeaveRequestsByStaffId(staffId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests", "staffId", staffId],
    queryFn: async () => {
      if (!actor || !staffId) return [];
      return actor.getLeaveRequestsByStaffId(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

export function useSubmitLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      staffId: string;
      leaveType: string;
      startDate: bigint;
      endDate: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitLeaveRequest(
        data.staffId,
        data.leaveType,
        data.startDate,
        data.endDate,
        data.reason,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useApproveLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.approveLeaveRequest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useRejectLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectLeaveRequest(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

// ── HR - Payroll ───────────────────────────────────────────────────────────
export function usePayrollByStaff(staffId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PayrollRecord[]>({
    queryKey: ["payroll", staffId],
    queryFn: async () => {
      if (!actor || !staffId) return [];
      return actor.getPayrollRecordsByStaff(staffId);
    },
    enabled: !!actor && !isFetching && !!staffId,
  });
}

export function useGeneratePayroll() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      staffId: string;
      month: bigint;
      year: bigint;
      basicSalary: bigint;
      allowances: bigint;
      deductions: bigint;
      netPay: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.generatePayroll(
        data.staffId,
        data.month,
        data.year,
        data.basicSalary,
        data.allowances,
        data.deductions,
        data.netPay,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

export function useMarkPayrollAsPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.markPayrollAsPaid(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}

// ── LMS - Courses ──────────────────────────────────────────────────────────
export function useAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCourse(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Course>({
    queryKey: ["course", id],
    queryFn: async () => {
      if (!actor || !id) throw new Error("No actor or id");
      return actor.getCourse(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddOrUpdateCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      teacherId: string;
      classId: string;
      subject: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateCourse(
        data.title,
        data.description,
        data.teacherId,
        data.classId,
        data.subject,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteCourse(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

// ── LMS - Lessons ──────────────────────────────────────────────────────────
export function useLessonsByCourse(courseId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Lesson[]>({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      return actor.getLessonsByCourse(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId,
  });
}

export function useAddOrUpdateLesson() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      courseId: string;
      title: string;
      contentText: string;
      orderIndex: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateLesson(
        data.courseId,
        data.title,
        data.contentText,
        data.orderIndex,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["lessons", vars.courseId] }),
  });
}

// ── LMS - Assignments ──────────────────────────────────────────────────────
export function useAssignmentsByCourse(courseId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Assignment[]>({
    queryKey: ["assignments", courseId],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      return actor.getAssignmentsByCourse(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId,
  });
}

export function useAddOrUpdateAssignment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      courseId: string;
      title: string;
      instructions: string;
      dueDate: bigint;
      maxScore: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addOrUpdateAssignment(
        data.courseId,
        data.title,
        data.instructions,
        data.dueDate,
        data.maxScore,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["assignments", vars.courseId] }),
  });
}

// ── LMS - Submissions ─────────────────────────────────────────────────────
export function useSubmissionsByAssignment(assignmentId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<AssignmentSubmission[]>({
    queryKey: ["submissions", assignmentId],
    queryFn: async () => {
      if (!actor || !assignmentId) return [];
      return actor.getSubmissionsByAssignment(assignmentId);
    },
    enabled: !!actor && !isFetching && !!assignmentId,
  });
}

export function useGradeSubmission() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      submissionId: string;
      score: bigint;
      feedback: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.gradeSubmission(
        data.submissionId,
        data.score,
        data.feedback,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
}

// ── LMS - Resource Links ───────────────────────────────────────────────────
export function useResourceLinksByCourse(courseId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ResourceLink[]>({
    queryKey: ["resources", courseId],
    queryFn: async () => {
      if (!actor || !courseId) return [];
      return actor.getResourceLinksByCourse(courseId);
    },
    enabled: !!actor && !isFetching && !!courseId,
  });
}

export function useAddResourceLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      courseId: string;
      title: string;
      url: string;
      resourceType: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addResourceLink(
        data.courseId,
        data.title,
        data.url,
        data.resourceType,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["resources", vars.courseId] }),
  });
}

// ── Admissions ─────────────────────────────────────────────────────────────
export function useAllApplicants() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["applicants"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplicants();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateApplicant() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      programApplied: string;
      classApplied: string;
      dateApplied: bigint;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createApplicant(
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.programApplied,
        data.classApplied,
        data.dateApplied,
        data.status,
        data.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applicants"] }),
  });
}

export function useUpdateApplicantStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateApplicantStatus(data.id, data.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applicants"] }),
  });
}

export function useConvertApplicantToStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicantId: string) => {
      if (!actor) throw new Error("No actor");
      return actor.convertApplicantToStudent(applicantId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// ── Fee Structures ─────────────────────────────────────────────────────────
export function useAllFeeStructures() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["feeStructures"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeeStructures();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFeeStructure() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      amount: bigint;
      gradeLevel: string;
      academicYear: string;
      feeType: string;
      feeTypeLabel: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createFeeStructure(
        data.name,
        data.description,
        data.amount,
        data.gradeLevel,
        data.academicYear,
        data.feeType,
        data.feeTypeLabel,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeStructures"] }),
  });
}

export function useUpdateFeeStructure() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      name: string;
      description: string;
      amount: bigint;
      gradeLevel: string;
      academicYear: string;
      feeType: string;
      feeTypeLabel: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFeeStructure(
        data.id,
        data.name,
        data.description,
        data.amount,
        data.gradeLevel,
        data.academicYear,
        data.feeType,
        data.feeTypeLabel,
        data.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeStructures"] }),
  });
}

export function useDeleteFeeStructure() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFeeStructure(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feeStructures"] }),
  });
}

// ── Invoices ───────────────────────────────────────────────────────────────
export function useAllStudentInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudentInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStudentInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      studentId: string;
      feeStructureId: string;
      amount: bigint;
      dueDate: bigint;
      status: string;
      issuedDate: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createStudentInvoice(
        data.studentId,
        data.feeStructureId,
        data.amount,
        data.dueDate,
        data.status,
        data.issuedDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateStudentInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      studentId: string;
      feeStructureId: string;
      amount: bigint;
      dueDate: bigint;
      status: string;
      issuedDate: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudentInvoice(
        data.id,
        data.studentId,
        data.feeStructureId,
        data.amount,
        data.dueDate,
        data.status,
        data.issuedDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUnpaidInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["invoices", "unpaid"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnpaidInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Payments ───────────────────────────────────────────────────────────────
export function useAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      invoiceId: string;
      studentId: string;
      amount: bigint;
      paymentDate: bigint;
      method: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPayment(
        data.invoiceId,
        data.studentId,
        data.amount,
        data.paymentDate,
        data.method,
        data.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["totalFeesCollected"] });
    },
  });
}

export function useTotalFeesCollected() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalFeesCollected"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalFeesCollected();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Expenses ───────────────────────────────────────────────────────────────
export function useAllExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      category: string;
      description: string;
      amount: bigint;
      date: bigint;
      approvedBy: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createExpense(
        data.category,
        data.description,
        data.amount,
        data.date,
        data.approvedBy,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["totalExpenses"] });
    },
  });
}

export function useUpdateExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: string;
      category: string;
      description: string;
      amount: bigint;
      date: bigint;
      approvedBy: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateExpense(
        data.id,
        data.category,
        data.description,
        data.amount,
        data.date,
        data.approvedBy,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["totalExpenses"] });
    },
  });
}

export function useDeleteExpense() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteExpense(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["totalExpenses"] });
    },
  });
}

export function useTotalExpenses() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalExpenses"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalExpenses();
    },
    enabled: !!actor && !isFetching,
  });
}
