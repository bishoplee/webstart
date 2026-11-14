import { PublicShell } from "@/components/layout/public-shell";

export default function PrivacyPolicyPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
            Data Protection & Privacy
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Compliant with the Nigeria Data Protection Act (NDPA) and international
            data protection standards.
          </p>
        </div>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            1. Information Collected During Project Discovery
          </h2>
          <p>
            WebStart collects organisation contact details, website requirements,
            branding preferences, and supporting documents solely for the purpose of
            scoping, designing, and delivering software development projects for
            participating clients.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            2. Prohibition of Passwords and Secret Credentials
          </h2>
          <p>
            WebStart questionnaires are designed never to request plaintext
            passwords, database credentials, or secret API keys. Clients are
            instructed to share technical access details only through dedicated
            encrypted secret-sharing channels during project execution.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            3. Workspace Isolation & File Security
          </h2>
          <p>
            Every client and project record is isolated to its owning agency
            workspace. Invitation links are protected via cryptographic SHA-256
            token hashes with expiration and revocation controls. Uploaded files are
            validated on the server and restricted to authorized workspace personnel.
          </p>
        </section>

        <section className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            4. Data Retention, Export & Deletion Rights (NDPA Compliance)
          </h2>
          <p>
            Clients may request a full Markdown or PDF export of their submitted
            discovery responses, update inaccurate information, or request deletion
            of uploaded project files and personal contact information through their
            assigned agency administrator.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
