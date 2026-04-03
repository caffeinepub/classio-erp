import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed || installed) return null;

  return (
    <div
      data-ocid="pwa.install.panel"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3 shadow-lg md:px-6"
    >
      <div className="flex items-center gap-3">
        <img
          src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
          alt="Classio ERP"
          className="h-8 w-8 rounded object-cover"
        />
        <p className="text-sm text-foreground">
          <span className="font-semibold">Install Classio ERP</span>
          <span className="ml-1 text-muted-foreground hidden sm:inline">
            for quick access from your home screen
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          data-ocid="pwa.install.primary_button"
          size="sm"
          onClick={handleInstall}
        >
          Install App
        </Button>
        <Button
          data-ocid="pwa.install.close_button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
