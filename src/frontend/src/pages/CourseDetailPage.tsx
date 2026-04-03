import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  Link as LinkIcon,
  Loader2,
  Play,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared";
import {
  useAddOrUpdateAssignment,
  useAddOrUpdateLesson,
  useAddResourceLink,
  useAssignmentsByCourse,
  useGetCourse,
  useLessonsByCourse,
  useResourceLinksByCourse,
} from "../hooks/useQueries";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

type LessonForm = {
  title: string;
  contentText: string;
  orderIndex: string;
};

type AssignmentForm = {
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: string;
};

type ResourceForm = {
  title: string;
  url: string;
  resourceType: string;
};

export default function CourseDetailPage({
  courseId,
  onBack,
}: {
  courseId: string;
  onBack: () => void;
}) {
  const { data: course, isLoading: courseLoading } = useGetCourse(courseId);
  const { data: lessons, isLoading: lessonsLoading } =
    useLessonsByCourse(courseId);
  const { data: assignments, isLoading: assignmentsLoading } =
    useAssignmentsByCourse(courseId);
  const { data: resources, isLoading: resourcesLoading } =
    useResourceLinksByCourse(courseId);
  const addLesson = useAddOrUpdateLesson();
  const addAssignment = useAddOrUpdateAssignment();
  const addResource = useAddResourceLink();

  const [lessonModal, setLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState<LessonForm>({
    title: "",
    contentText: "",
    orderIndex: "1",
  });

  const [assignmentModal, setAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    title: "",
    instructions: "",
    dueDate: new Date().toISOString().split("T")[0],
    maxScore: "100",
  });

  const [resourceModal, setResourceModal] = useState(false);
  const [resourceForm, setResourceForm] = useState<ResourceForm>({
    title: "",
    url: "",
    resourceType: "link",
  });

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLesson.mutateAsync({
        courseId,
        title: lessonForm.title,
        contentText: lessonForm.contentText,
        orderIndex: BigInt(Number.parseInt(lessonForm.orderIndex) || 1),
      });
      toast.success("Lesson added");
      setLessonModal(false);
      setLessonForm({ title: "", contentText: "", orderIndex: "1" });
    } catch {
      toast.error("Failed to add lesson");
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAssignment.mutateAsync({
        courseId,
        title: assignmentForm.title,
        instructions: assignmentForm.instructions,
        dueDate: dateToBigInt(new Date(assignmentForm.dueDate)),
        maxScore: BigInt(Number.parseInt(assignmentForm.maxScore) || 100),
      });
      toast.success("Assignment added");
      setAssignmentModal(false);
    } catch {
      toast.error("Failed to add assignment");
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addResource.mutateAsync({
        courseId,
        title: resourceForm.title,
        url: resourceForm.url,
        resourceType: resourceForm.resourceType,
      });
      toast.success("Resource added");
      setResourceModal(false);
    } catch {
      toast.error("Failed to add resource");
    }
  };

  const sortedLessons = [...(lessons ?? [])].sort((a, b) =>
    Number(a.orderIndex - b.orderIndex),
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        type="button"
        data-ocid="course.detail.back.button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </button>

      {courseLoading ? (
        <Skeleton className="h-20 mb-6" />
      ) : course ? (
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold">{course.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {course.description}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
              {course.subject}
            </span>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="lessons">
        <TabsList data-ocid="course.detail.tab">
          <TabsTrigger value="lessons">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="resources">
            <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Lessons */}
        <TabsContent value="lessons" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              data-ocid="course.lessons.add.primary_button"
              size="sm"
              onClick={() => setLessonModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Lesson
            </Button>
          </div>
          {lessonsLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-20" />
              ))}
            </div>
          ) : sortedLessons.length === 0 ? (
            <EmptyState
              title="No lessons yet"
              description="Add the first lesson to this course"
              ocid="course.lessons.empty_state"
            />
          ) : (
            <div className="space-y-3">
              {sortedLessons.map((l, i) => (
                <div
                  key={l.id}
                  data-ocid={`course.lessons.item.${i + 1}`}
                  className="bg-card border border-border rounded-lg p-4 shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                      <span className="text-primary text-xs font-bold">
                        {Number(l.orderIndex)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{l.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {l.contentText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              data-ocid="course.assignments.add.primary_button"
              size="sm"
              onClick={() => setAssignmentModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Assignment
            </Button>
          </div>
          {assignmentsLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-20" />
              ))}
            </div>
          ) : !assignments || assignments.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="Create the first assignment"
              ocid="course.assignments.empty_state"
            />
          ) : (
            <div className="space-y-3">
              {assignments.map((a, i) => (
                <div
                  key={a.id}
                  data-ocid={`course.assignments.item.${i + 1}`}
                  className="bg-card border border-border rounded-lg p-4 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{a.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {a.instructions}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs text-muted-foreground">
                        Due: {bigIntToDateString(a.dueDate)}
                      </p>
                      <p className="text-xs font-medium text-primary mt-1">
                        Max: {Number(a.maxScore)} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              data-ocid="course.resources.add.primary_button"
              size="sm"
              onClick={() => setResourceModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Resource
            </Button>
          </div>
          {resourcesLoading ? (
            <div className="space-y-3">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-16" />
              ))}
            </div>
          ) : !resources || resources.length === 0 ? (
            <EmptyState
              title="No resources yet"
              description="Add links, videos, or documents"
              ocid="course.resources.empty_state"
            />
          ) : (
            <div className="space-y-2">
              {resources.map((r, i) => (
                <div
                  key={r.id}
                  data-ocid={`course.resources.item.${i + 1}`}
                  className="bg-card border border-border rounded-lg p-3 shadow-card flex items-center gap-3"
                >
                  <div className="bg-muted rounded-lg p-2 shrink-0">
                    {r.resourceType === "video" ? (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.title}</p>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline truncate block"
                    >
                      {r.url}
                    </a>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize shrink-0">
                    {r.resourceType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Lesson Modal */}
      <Dialog open={lessonModal} onOpenChange={setLessonModal}>
        <DialogContent data-ocid="course.lesson.modal">
          <DialogHeader>
            <DialogTitle>Add Lesson</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lesson Title *</Label>
                <Input
                  data-ocid="course.lesson.modal.title.input"
                  required
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input
                  data-ocid="course.lesson.modal.order.input"
                  type="number"
                  min="1"
                  value={lessonForm.orderIndex}
                  onChange={(e) =>
                    setLessonForm((f) => ({ ...f, orderIndex: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                data-ocid="course.lesson.modal.content.textarea"
                value={lessonForm.contentText}
                onChange={(e) =>
                  setLessonForm((f) => ({ ...f, contentText: e.target.value }))
                }
                rows={4}
                placeholder="Lesson content..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="course.lesson.modal.cancel_button"
                onClick={() => setLessonModal(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="course.lesson.modal.submit_button"
                type="submit"
                disabled={addLesson.isPending}
              >
                {addLesson.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Lesson
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={assignmentModal} onOpenChange={setAssignmentModal}>
        <DialogContent data-ocid="course.assignment.modal">
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAssignment} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                data-ocid="course.assignment.modal.title.input"
                required
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                data-ocid="course.assignment.modal.instructions.textarea"
                value={assignmentForm.instructions}
                onChange={(e) =>
                  setAssignmentForm((f) => ({
                    ...f,
                    instructions: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  data-ocid="course.assignment.modal.duedate.input"
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) =>
                    setAssignmentForm((f) => ({
                      ...f,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max Score</Label>
                <Input
                  data-ocid="course.assignment.modal.maxscore.input"
                  type="number"
                  value={assignmentForm.maxScore}
                  onChange={(e) =>
                    setAssignmentForm((f) => ({
                      ...f,
                      maxScore: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="course.assignment.modal.cancel_button"
                onClick={() => setAssignmentModal(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="course.assignment.modal.submit_button"
                type="submit"
                disabled={addAssignment.isPending}
              >
                {addAssignment.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Assignment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resource Modal */}
      <Dialog open={resourceModal} onOpenChange={setResourceModal}>
        <DialogContent data-ocid="course.resource.modal">
          <DialogHeader>
            <DialogTitle>Add Resource Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                data-ocid="course.resource.modal.title.input"
                required
                value={resourceForm.title}
                onChange={(e) =>
                  setResourceForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                data-ocid="course.resource.modal.url.input"
                required
                type="url"
                value={resourceForm.url}
                onChange={(e) =>
                  setResourceForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={resourceForm.resourceType}
                onValueChange={(v) =>
                  setResourceForm((f) => ({ ...f, resourceType: v }))
                }
              >
                <SelectTrigger data-ocid="course.resource.modal.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="course.resource.modal.cancel_button"
                onClick={() => setResourceModal(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="course.resource.modal.submit_button"
                type="submit"
                disabled={addResource.isPending}
              >
                {addResource.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Resource
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
