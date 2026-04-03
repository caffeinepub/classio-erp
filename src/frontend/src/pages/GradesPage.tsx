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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import {
  useAllStudents,
  useGradesByStudent,
  useRecordGrade,
} from "../hooks/useQueries";

type GradeForm = {
  subject: string;
  term: string;
  score: string;
  remarks: string;
};

const emptyForm: GradeForm = { subject: "", term: "", score: "", remarks: "" };

function getGradeColor(score: number) {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export default function GradesPage() {
  const { data: students } = useAllStudents();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GradeForm>(emptyForm);

  const { data: grades, isLoading } = useGradesByStudent(selectedStudentId);
  const recordGrade = useRecordGrade();

  const selectedStudent = students?.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Select a student");
      return;
    }
    try {
      await recordGrade.mutateAsync({
        studentId: selectedStudentId,
        subject: form.subject,
        term: form.term,
        score: BigInt(Number.parseInt(form.score)),
        remarks: form.remarks,
      });
      toast.success("Grade recorded");
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      toast.error("Failed to record grade");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Grades"
        description="Record and view student grades"
        actions={
          selectedStudentId && (
            <Button
              data-ocid="grades.add.primary_button"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Record Grade
            </Button>
          )
        }
      />

      <div className="space-y-2 mb-6">
        <Label>Select Student</Label>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger data-ocid="grades.student.select" className="max-w-sm">
            <SelectValue placeholder="Choose a student" />
          </SelectTrigger>
          <SelectContent>
            {(students ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName} (Grade {Number(s.grade)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudentId && showForm && (
        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              Record Grade for {selectedStudent?.firstName}{" "}
              {selectedStudent?.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    data-ocid="grades.form.subject.input"
                    required
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term *</Label>
                  <Input
                    data-ocid="grades.form.term.input"
                    required
                    value={form.term}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, term: e.target.value }))
                    }
                    placeholder="e.g. Term 1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Score (0-100) *</Label>
                <Input
                  data-ocid="grades.form.score.input"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={form.score}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, score: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Remarks</Label>
                <Textarea
                  data-ocid="grades.form.remarks.textarea"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                  placeholder="Optional remarks..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="grades.form.cancel_button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  data-ocid="grades.form.submit_button"
                  type="submit"
                  disabled={recordGrade.isPending}
                >
                  {recordGrade.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Grade
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {selectedStudentId && (
        <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <p className="font-semibold text-sm">
              Grade Records — {selectedStudent?.firstName}{" "}
              {selectedStudent?.lastName}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Subject</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : !grades || grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      title="No grades yet"
                      description="Record the first grade for this student"
                      ocid="grades.list.empty_state"
                      action={
                        <Button size="sm" onClick={() => setShowForm(true)}>
                          <Plus className="h-3 w-3 mr-1" />
                          Record Grade
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                grades.map((g, i) => {
                  const score = Number(g.score);
                  const letterGrade =
                    score >= 90
                      ? "A"
                      : score >= 80
                        ? "B"
                        : score >= 70
                          ? "C"
                          : score >= 60
                            ? "D"
                            : "F";
                  return (
                    <TableRow
                      key={`${g.subject}-${g.term}-${i}`}
                      data-ocid={`grades.list.item.${i + 1}`}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="font-medium">{g.subject}</TableCell>
                      <TableCell>{g.term}</TableCell>
                      <TableCell>
                        <span
                          className={cn("font-semibold", getGradeColor(score))}
                        >
                          {score}/100
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "font-bold text-sm",
                            getGradeColor(score),
                          )}
                        >
                          {letterGrade}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {g.remarks || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
