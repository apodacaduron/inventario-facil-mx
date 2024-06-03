import { useToast } from "@/components/ui";

export function errorToString(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error;
  }
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
}

export function notifyIfHasError(error: unknown) {
  const { toast } = useToast();

  if (!error) return;
  toast({
    title: "Uh oh! Something went wrong.",
    description:
      errorToString(error) ?? "There was a problem with your request.",
    variant: "destructive",
  });
}
