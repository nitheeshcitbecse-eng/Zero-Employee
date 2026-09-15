import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "@/lib/router";
import { authApi } from "../api/auth";
import { queryKeys } from "../lib/queryKeys";
import { getRememberedInvitePath } from "../lib/invite-memory";
import { Button } from "@/components/ui/button";
import { ZeroLoading, ZeroGlyph } from "@/components/ZeroMark";
import { ZeroLockup } from "@/components/ZeroLockup";
import { ThemeToggle } from "@/components/ThemeToggle";

type AuthMode = "sign_in" | "sign_up";

/**
 * Field chrome is declared once and shared by all three inputs. They are
 * visually identical, and keeping one string means a change to the focus
 * treatment cannot land on two of them and miss the third.
 */
const fieldClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground " +
  "outline-none transition-colors placeholder:text-muted-foreground/50 " +
  "focus:border-primary/40 focus:ring-2 focus:ring-ring/25";

const labelClass =
  "mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground";

export function AuthPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const errorId = "auth-error";

  const nextPath = useMemo(
    () => searchParams.get("next") || getRememberedInvitePath() || "/",
    [searchParams],
  );
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: () => authApi.getSession(),
    retry: false,
  });

  useEffect(() => {
    if (session) {
      navigate(nextPath, { replace: true });
    }
  }, [session, navigate, nextPath]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === "sign_in") {
        await authApi.signInEmail({ email: email.trim(), password });
        return;
      }
      await authApi.signUpEmail({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    },
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.health });
      // Reset rather than invalidate: the `["companies"]` entry is shared app-wide and
      // is not account-scoped, so invalidating leaves the previous account's list
      // readable (and any fetch for that session in flight) until the refetch lands.
      // Sign-in can change accounts, so drop the list outright.
      await queryClient.resetQueries({ queryKey: queryKeys.companies.all });
      navigate(nextPath, { replace: true });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Authentication failed");
    },
  });

  const isSignIn = mode === "sign_in";
  const canSubmit =
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    (isSignIn || (name.trim().length > 0 && password.trim().length >= 8));

  if (isSessionLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <ZeroLoading className="min-h-0" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      {/* Form side */}
      <div className="flex w-full flex-col overflow-y-auto md:w-1/2">
        <div className="mx-auto my-auto w-full max-w-[26rem] px-8 py-14">
          <ZeroLockup className="mb-12" />

          <h1 className="font-heading text-[2rem] leading-[1.15] tracking-[-0.02em] text-foreground">
            {isSignIn ? "Welcome back." : "Start your company."}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {isSignIn
              ? "Sign in to reach your workspace and the agents running in it."
              : "Create an account on this instance. No email confirmation required."}
          </p>

          <form
            className="mt-9 space-y-5"
            method="post"
            action={isSignIn ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email"}
            onSubmit={(event) => {
              event.preventDefault();
              if (mutation.isPending) return;
              if (!canSubmit) {
                setError("Please fill in all required fields.");
                return;
              }
              mutation.mutate();
            }}
          >
            {!isSignIn && (
              <div>
                <label htmlFor="name" className={labelClass}>Name</label>
                <input
                  id="name"
                  name="name"
                  className={fieldClass}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  autoFocus
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                name="email"
                className={fieldClass}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                autoFocus={isSignIn}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>Password</label>
              <input
                id="password"
                name="password"
                className={fieldClass}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
              />
              {!isSignIn && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  At least 8 characters.
                </p>
              )}
            </div>
            {error && (
              <p id={errorId} role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              aria-disabled={!canSubmit || mutation.isPending}
              className={
                "w-full rounded-xl" +
                (!canSubmit && !mutation.isPending ? " opacity-50" : "")
              }
            >
              {mutation.isPending ? "Working…" : isSignIn ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
            {isSignIn ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setError(null);
                setMode(isSignIn ? "sign_up" : "sign_in");
              }}
            >
              {isSignIn ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/*
        Editorial side. Hidden below md, where the form already fills the
        viewport and a second column would only push it off-screen.
        The oversized mark bleeds off the corner at very low opacity, so it
        reads as paper texture rather than as a second logo competing with
        the lockup on the form side.
      */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-secondary px-14 py-16 md:flex">
        <ZeroGlyph className="pointer-events-none absolute -bottom-32 -right-28 h-[30rem] w-[30rem] text-primary/[0.06]" />
        <div className="relative h-px w-16 bg-primary/40" />
        <blockquote className="relative max-w-md">
          <p className="font-heading text-[2.35rem] leading-[1.16] tracking-[-0.022em] text-foreground">
            Headcount stopped being the constraint.
          </p>
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Set the goals and the budget. Agents carry the work from there, with an
            org chart, a paper trail, and something accountable for every run.
          </p>
        </blockquote>
        <p className="relative text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
          Self-hosted · Runs on your infrastructure
        </p>
      </aside>
    </div>
  );
}
