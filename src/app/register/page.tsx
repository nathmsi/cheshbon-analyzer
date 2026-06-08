import { Suspense } from "react";
import { isGoogleAuthConfigured } from "@/lib/auth/google-configured";
import { RegisterClient } from "./register-client";

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-muted">...</p>}>
      <RegisterClient googleEnabled={isGoogleAuthConfigured()} />
    </Suspense>
  );
}
