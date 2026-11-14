import { PublicShell } from "@/components/layout/public-shell";

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Platform Terms
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Terms of Service
          </h1>
        </div>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            1. Scope of Platform Use
          </h2>
          <p>
            WebStart provides structured client discovery questionnaires, document
            upload management, and project brief generation for web development
            agencies and their invited clients.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            2. Intellectual Property & Uploaded Materials
          </h2>
          <p>
            Clients retain full ownership of all brand assets, logos, written copy,
            and business documentation uploaded to their discovery session.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            3. Questionnaire Submission & Revisions
          </h2>
          <p>
            Upon final confirmation and submission of a discovery questionnaire,
            responses are locked for agency review. Subsequent modifications may be
            performed via formal clarification requests or when an administrator
            reopens the submission.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
