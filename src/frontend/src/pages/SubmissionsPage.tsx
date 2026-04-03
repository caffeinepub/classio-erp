import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import {
  useAllCourses,
  useAssignmentsByCourse,
  useGradeSubmission,
  useSubmissionsByAssignment,
} from "../hooks/useQueries";
import { bigIntToDateString } from "../utils/dateUtils";

export default function SubmissionsPage() {
  const { data: courses } = useAllCourses();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  const { data: assignments } = useAssignmentsByCourse(selectedCourseId);
  const { data: submissions, isLoading } =
    useSubmissionsByAssignment(selectedAssignmentId);
  const gradeSubmission = useGradeSubmission();

  const [gradingId, setGradingId] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const selectedAssignment = assignments?.find(
    (a) => a.id === selectedAssignmentId,
  );

  const handleGrade = async (submissionId: string) => {
    try {
      await gradeSubmission.mutateAsync({
        submissionId,
        score: BigInt(Number.parseInt(score) || 0),
        feedback,
      });
      toast.success("Submission graded");
      setGradingId(null);
      setScore("");
      setFeedback("");
    } catch {
      toast.error("Grading failed");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Assignment Submissions"
        description="Review and grade student assignment submissions"
      />

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Select Course</Label>
          <Select
            value={selectedCourseId}
            onValueChange={(v) => {
              setSelectedCourseId(v);
              setSelectedAssignmentId("");
            }}
          >
            <SelectTrigger data-ocid="submissions.course.select">
              <SelectValue placeholder="Choose a course" />
            </SelectTrigger>
            <SelectContent>
              {(courses ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Select Assignment</Label>
          <Select
            value={selectedAssignmentId}
            onValueChange={setSelectedAssignmentId}
            disabled={!selectedCourseId}
          >
            <SelectTrigger data-ocid="submissions.assignment.select">
              <SelectValue placeholder="Choose an assignment" />
            </SelectTrigger>
            <SelectContent>
              {(assignments ?? []).map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedAssignmentId && (
        <div className="mb-4 p-3 bg-muted/50 border border-border rounded-lg">
          <p className="text-sm font-medium">{selectedAssignment?.title}</p>
          <p className="text-xs text-muted-foreground">
            Max Score: {Number(selectedAssignment?.maxScore ?? 0)} pts &bull;
            Due:{" "}
            {selectedAssignment
              ? bigIntToDateString(selectedAssignment.dueDate)
              : ""}
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Student ID</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!selectedAssignmentId ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="Select a course and assignment"
                    description="Choose above to view submissions"
                    ocid="submissions.list.empty_state"
                  />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              ["s1", "s2", "s3"].map((sk) => (
                <TableRow key={sk}>
                  {["c1", "c2", "c3", "c4", "c5", "c6"].map((ck) => (
                    <TableCell key={ck}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !submissions || submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState
                    title="No submissions yet"
                    description="Students haven't submitted yet"
                    ocid="submissions.list.empty_state"
                  />
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((s, i) => (
                <>
                  <TableRow
                    key={s.id}
                    data-ocid={`submissions.list.item.${i + 1}`}
                    className="hover:bg-muted/30"
                  >
                    <TableCell className="font-mono text-xs">
                      {s.studentId.slice(0, 12)}...
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {bigIntToDateString(s.submittedAt)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm line-clamp-2">{s.submissionText}</p>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                          s.isGraded
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {s.isGraded ? "Graded" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {s.isGraded ? `${Number(s.score ?? 0)} pts` : "—"}
                    </TableCell>
                    <TableCell>
                      {!s.isGraded && (
                        <button
                          type="button"
                          data-ocid={`submissions.list.grade_button.${i + 1}`}
                          onClick={() =>
                            setGradingId(gradingId === s.id ? null : s.id)
                          }
                          className="text-xs text-primary hover:underline"
                        >
                          {gradingId === s.id ? "Cancel" : "Grade"}
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                  {gradingId === s.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="flex gap-3 items-end p-2">
                          <div className="space-y-1">
                            <Label className="text-xs">
                              Score (0-
                              {Number(selectedAssignment?.maxScore ?? 100)})
                            </Label>
                            <Input
                              data-ocid={`submissions.grade.score.input.${i + 1}`}
                              type="number"
                              min="0"
                              max={Number(selectedAssignment?.maxScore ?? 100)}
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              className="w-28 h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1 flex-1">
                            <Label className="text-xs">Feedback</Label>
                            <Textarea
                              data-ocid={`submissions.grade.feedback.textarea.${i + 1}`}
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={1}
                              className="text-sm resize-none"
                            />
                          </div>
                          <Button
                            data-ocid={`submissions.grade.submit_button.${i + 1}`}
                            size="sm"
                            onClick={() => handleGrade(s.id)}
                            disabled={!score || gradeSubmission.isPending}
                          >
                            {gradeSubmission.isPending && (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            )}
                            Submit Grade
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
