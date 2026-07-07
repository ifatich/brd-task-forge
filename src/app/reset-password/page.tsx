import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
