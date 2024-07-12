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
export function isDangerError(error: unknown) {
  if (typeof error !== 'object') return;
  if (error === null) return;
  if (!('status' in error)) return;
  if (typeof error.status !== 'number') return;

  return error.status >= 400
}

export function notifyIfHasError(error: unknown) {
  const { toast } = useToast();

  if (!error) return;
  toast({
    title: "Uh oh! Algo salió mal.",
    description:
      errorToString(error) ?? "Hubo un problema con tu solicitud.",
    variant: "destructive",
  });

  if (isDangerError(error)) {
    throw new Error(errorToString(error))
  }
}
