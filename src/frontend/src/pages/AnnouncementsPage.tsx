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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "../components/shared";
import {
  useAllAnnouncements,
  useCreateAnnouncement,
} from "../hooks/useQueries";
import { useCallerUserProfile } from "../hooks/useQueries";
import { bigIntToDateString } from "../utils/dateUtils";

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAllAnnouncements();
  const { data: profile } = useCallerUserProfile();
  const createAnnouncement = useCreateAnnouncement();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement.mutateAsync({
        title,
        body,
        authorName: profile?.name ?? "Admin",
      });
      toast.success("Announcement posted");
      setModalOpen(false);
      setTitle("");
      setBody("");
    } catch {
      toast.error("Failed to post announcement");
    }
  };

  const sorted = [...(announcements ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Announcements"
        description="School-wide notices and communications"
        actions={
          <Button
            data-ocid="announcements.add.primary_button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Announcement
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {["s1", "s2", "s3"].map((k) => (
            <Skeleton key={k} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Post the first announcement for your school"
          ocid="announcements.list.empty_state"
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {sorted.map((a, i) => (
            <div
              key={a.id}
              data-ocid={`announcements.list.item.${i + 1}`}
              className="bg-card border border-border rounded-lg p-5 shadow-card"
            >
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-lg p-2 shrink-0">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {bigIntToDateString(a.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{a.body}</p>
                  <p className="text-xs text-primary mt-2 font-medium">
                    — {a.authorName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="announcements.modal">
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                data-ocid="announcements.modal.title.input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                data-ocid="announcements.modal.body.textarea"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                data-ocid="announcements.modal.cancel_button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                data-ocid="announcements.modal.submit_button"
                type="submit"
                disabled={createAnnouncement.isPending}
              >
                {createAnnouncement.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Post Announcement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
