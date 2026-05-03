import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: {
    index: false,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Last updated: May 2026
          </p>
        </div>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            Introduction
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Welcome to our application. These Terms of Service govern your
            access to and use of our platform. By accessing or using this
            application, you agree to be bound by these terms. Please read them
            carefully before proceeding to use our services.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            Development Status
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Blenvi is under active development. Features, APIs, schemas, and
            integrations may change as the project evolves. Use self-hosted or
            trusted deployments for any real operational data.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            Open Source
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            This is an open-source project. The source code is available for
            review, modification, and distribution under the applicable
            open-source license. We encourage community contributions and
            feedback to help improve the project. Please refer to the project
            repository for licensing details and contribution guidelines.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            No Warranty
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            This application is provided &ldquo;as is&rdquo; without any
            warranties of any kind, either express or implied. We expressly
            disclaim all warranties, including but not limited to implied
            warranties of merchantability, fitness for a particular purpose, and
            non-infringement. We do not warrant that the application will be
            uninterrupted, timely, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            Data Usage
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Data you provide may be stored to power workspace, project, and
            integration monitoring features. Experimental deployments may be
            reset during maintenance, migrations, or active development. Do not
            enter sensitive credentials unless you control and trust the
            deployment.
          </p>
        </section>

        <section>
          <h2 className="text-foreground mb-3 text-xl font-semibold">
            Changes to These Terms
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            We reserve the right to modify or replace these Terms of Service at
            any time at our sole discretion. It is your responsibility to review
            these terms periodically for changes. Your continued use of the
            application following the posting of any changes constitutes
            acceptance of those changes.
          </p>
        </section>

        <section className="border-border border-t pt-4">
          <p className="text-muted-foreground text-center text-sm">
            If you have any questions about these Terms of Service, please refer
            to the project documentation or repository for more information.
          </p>
        </section>
      </div>
    </div>
  );
}
