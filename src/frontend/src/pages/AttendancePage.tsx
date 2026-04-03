import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import {
  useAllClasses,
  useAllStudents,
  useAttendanceByClass,
  useRecordAttendance,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

export default function AttendancePage() {
  const { data: classes } = useAllClasses();
  const { data: students } = useAllStudents();
  const recordAttendance = useRecordAttendance();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set());

  const { data: attendanceRecords, isLoading: recordsLoading } =
    useAttendanceByClass(selectedClassId);

  const selectedClass = classes?.find((c) => c.id === selectedClassId);

  // For the attendance form, use all active students
  const classStudents = (students ?? []).filter((s) => s.isActive);

  const toggleStudent = (id: string) => {
    setPresentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAll = (present: boolean) => {
    if (present) {
      setPresentIds(new Set(classStudents.map((s) => s.id)));
    } else {
      setPresentIds(new Set());
    }
  };

  const handleSubmit = async () => {
    if (!selectedClassId) {
      toast.error("Please select a class");
      return;
    }
    try {
      await recordAttendance.mutateAsync({
        classId: selectedClassId,
        date: dateToBigInt(new Date(selectedDate)),
        presentStudents: Array.from(presentIds),
        absentStudents: classStudents
          .filter((s) => !presentIds.has(s.id))
          .map((s) => s.id),
      });
      toast.success("Attendance recorded successfully");
    } catch {
      toast.error("Failed to record attendance");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Attendance"
        description="Record and view student attendance"
      />

      <Tabs defaultValue="record">
        <TabsList className="mb-6" data-ocid="attendance.tab">
          <TabsTrigger value="record">Record Attendance</TabsTrigger>
          <TabsTrigger value="history">View History</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Take Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Class *</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(v) => {
                      setSelectedClassId(v);
                      setPresentIds(new Set());
                    }}
                  >
                    <SelectTrigger data-ocid="attendance.class.select">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {(classes ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    data-ocid="attendance.date.input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {selectedClassId && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {selectedClass?.name} — {classStudents.length} students
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAll(true)}
                      >
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAll(false)}
                      >
                        Mark All Absent
                      </Button>
                    </div>
                  </div>

                  {classStudents.length === 0 ? (
                    <EmptyState
                      title="No students"
                      description="No active students found"
                      ocid="attendance.students.empty_state"
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {classStudents.map((s, i) => {
                        const isPresent = presentIds.has(s.id);
                        return (
                          <button
                            type="button"
                            key={s.id}
                            data-ocid={`attendance.student.toggle.${i + 1}`}
                            onClick={() => toggleStudent(s.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                              isPresent
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-red-200 bg-red-50/50 text-red-800",
                            )}
                          >
                            {isPresent ? (
                              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                            )}
                            <span className="text-sm font-medium">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="ml-auto text-xs opacity-60">
                              {isPresent ? "Present" : "Absent"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button
                      data-ocid="attendance.submit.primary_button"
                      onClick={handleSubmit}
                      disabled={recordAttendance.isPending}
                    >
                      {recordAttendance.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Attendance
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Attendance History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Filter by Class</Label>
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger data-ocid="attendance.history.class.select">
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClassId &&
                (recordsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !attendanceRecords || attendanceRecords.length === 0 ? (
                  <EmptyState
                    title="No attendance records"
                    description="No records found for this class"
                    ocid="attendance.history.empty_state"
                  />
                ) : (
                  <div className="space-y-3">
                    {attendanceRecords.map((record, i) => (
                      <div
                        key={`${record.classId}-${record.date.toString()}`}
                        data-ocid={`attendance.history.item.${i + 1}`}
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">
                            {bigIntToDateString(record.date)}
                          </p>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">
                              {record.presentStudents.length} Present
                            </span>
                            <span className="text-red-500">
                              {record.absentStudents.length} Absent
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
