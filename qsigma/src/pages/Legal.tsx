import PageShell, { PageHero, PageSection, Prose } from "@/components/qsigma/PageShell";

const UPDATED = "Last updated: August 31, 2026";

export function Terms() {
  return (
    <PageShell title="Terms & Conditions">
      <PageHero eyebrow="Legal" title="Terms & Conditions" intro={UPDATED} />
      <PageSection white narrow>
        <Prose>
          <h2>1. Who we are</h2>
          <p>
            These Terms govern your use of the Squared³ platform, website, and services (together, the
            "Service"). By creating an account or subscribing, you agree to these Terms. If you do not
            agree, do not use the Service.
          </p>
          <h2>2. What the Service is — and is not</h2>
          <p>
            Squared³ provides algorithmic trading strategies that generate execution instructions for
            your own brokerage account at a supported brokerage (Public.com, Alpaca, or Interactive
            Brokers). The Service is a software subscription. It is <strong>not</strong> a bank, a
            broker-dealer, or a custodian, and Squared³ never takes possession of your funds or
            securities.
          </p>
          <p>
            Nothing on the Service constitutes personalized investment advice or a recommendation that
            any strategy is suitable for your circumstances. You are responsible for determining
            whether a strategy fits your objectives and risk tolerance.
          </p>
          <h2>3. Eligibility and your account</h2>
          <ul>
            <li>You must be at least 18 years old and able to form a binding contract.</li>
            <li>You must maintain an account in your own name at a supported brokerage.</li>
            <li>You are responsible for safeguarding your login credentials and for all activity under your account.</li>
          </ul>
          <h2>4. Brokerage connection</h2>
          <p>
            You connect your brokerage through the brokerage's own authorization flow. Squared³
            receives execution-only permissions: we may place and manage orders consistent with your
            strategy subscriptions. We cannot withdraw funds, change banking links, or access your
            brokerage credentials. You may revoke the connection at any time from either platform.
          </p>
          <h2>5. Fees</h2>
          <p>
            The Service is provided for a one-time onboarding fee of $2,497 and an ongoing platform
            fee of 0.50% of connected assets under management per month, billed on average assets.
            Fees are disclosed before you pay and do not include brokerage commissions, regulatory
            fees, or taxes, which are charged by third parties. There are no performance fees and no
            lock-ups.
          </p>
          <h2>6. Performance information</h2>
          <p>
            Backtested results are hypothetical, have inherent limitations, and do not represent
            actual trading. Live performance figures are prepared from actual executions and audited
            by an independent US CPA. <strong>Past performance does not guarantee future results.
            Investing involves risk, including possible loss of principal.</strong>
          </p>
          <h2>7. Acceptable use</h2>
          <ul>
            <li>No reverse engineering, scraping, or resale of strategy signals.</li>
            <li>No use of the Service in violation of applicable law or your brokerage's terms.</li>
            <li>One subscription covers one household's brokerage accounts unless agreed otherwise in writing.</li>
          </ul>
          <h2>8. Termination</h2>
          <p>
            You may disconnect and stop using the Service at any time; your funds and positions remain
            in your brokerage account. We may suspend or terminate access for breach of these Terms.
            The onboarding fee is refundable within 30 days of purchase if no strategy has been
            activated on a connected account.
          </p>
          <h2>9. Disclaimers and liability</h2>
          <p>
            The Service is provided "as is." To the maximum extent permitted by law, Squared³
            disclaims all warranties and is not liable for indirect, incidental, or consequential
            damages, or for losses arising from market movements, brokerage outages, or your
            investment decisions. Our aggregate liability is limited to the fees you paid in the
            twelve months preceding the claim.
          </p>
          <h2>10. Changes and contact</h2>
          <p>
            We may update these Terms; material changes will be notified by email at least 30 days
            before taking effect. Questions: <strong>info@squaredq.com</strong>.
          </p>
        </Prose>
      </PageSection>
    </PageShell>
  );
}

export function Privacy() {
  return (
    <PageShell title="Privacy Policy">
      <PageHero eyebrow="Legal" title="Privacy Policy" intro={UPDATED} />
      <PageSection white narrow>
        <Prose>
          <h2>1. The short version</h2>
          <p>
            We collect the minimum needed to run the Service, we never sell your data, and we never
            see your brokerage credentials. You can request a copy or deletion of your data at any
            time.
          </p>
          <h2>2. What we collect</h2>
          <ul>
            <li><strong>Account data</strong> — name, email, and billing details you provide.</li>
            <li><strong>Brokerage data</strong> — positions, balances, and executions in connected accounts, received through the brokerage's authorized API. Credentials stay with your brokerage; the connection uses the brokerage's own OAuth flow.</li>
            <li><strong>Usage data</strong> — pages viewed and product actions, used to improve the Service.</li>
          </ul>
          <h2>3. How we use it</h2>
          <ul>
            <li>To execute the strategies you subscribe to and show you your performance.</li>
            <li>To bill the fees described in the Terms.</li>
            <li>To meet legal, audit, and tax-reporting obligations.</li>
            <li>To send service communications; marketing email is opt-in and every message has an unsubscribe link.</li>
          </ul>
          <h2>4. What we never do</h2>
          <ul>
            <li>We do not sell or rent personal data.</li>
            <li>We do not share account data with advertisers.</li>
            <li>We do not store brokerage credentials — ever.</li>
          </ul>
          <h2>5. Sharing</h2>
          <p>
            Data is shared only with the service providers required to operate the platform (cloud
            hosting, payment processing, analytics), with the independent auditor for performance
            verification, and where required by law. Providers are bound by confidentiality
            obligations.
          </p>
          <h2>6. Security and retention</h2>
          <p>
            Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Access is role-based and
            logged. We retain account records for as long as your account exists and thereafter as
            required by financial record-keeping laws, then delete them.
          </p>
          <h2>7. Your rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, export, or delete
            your personal data, and to object to certain processing. Write to
            <strong> info@squaredq.com</strong> and we will respond within 30 days.
          </p>
        </Prose>
      </PageSection>
    </PageShell>
  );
}

export function Disclosures() {
  return (
    <PageShell title="Financial Services Guide">
      <PageHero eyebrow="Legal" title="Financial Services Guide" intro={UPDATED} />
      <PageSection white narrow>
        <Prose>
          <h2>Purpose of this guide</h2>
          <p>
            This guide explains what Squared³ does, how we are paid, the risks of using the Service,
            and how complaints are handled — in plain language, before you pay anything.
          </p>
          <h2>The service</h2>
          <p>
            Squared³ supplies algorithmic trading strategies executed in your own brokerage account.
            Custody of your assets remains at all times with your brokerage — Public.com, Alpaca, or
            Interactive Brokers — each regulated in the United States. Squared³ holds execution-only
            authority and cannot move money in or out of your account.
          </p>
          <h2>How we are paid</h2>
          <ul>
            <li>One-time onboarding fee: <strong>$2,497</strong> (lifetime platform access).</li>
            <li>Platform fee: <strong>0.50% of connected AUM per month</strong>, billed on average assets.</li>
            <li>We receive <strong>no</strong> commissions, payment for order flow, spreads, or performance fees, and no payments from brokerages for directing your account to them.</li>
          </ul>
          <h2>Key risks</h2>
          <ul>
            <li><strong>Market risk</strong> — strategies can and do lose money; drawdowns shown in factsheets are historical, not maximums.</li>
            <li><strong>Model risk</strong> — systematic strategies can behave unexpectedly in regimes not present in their history.</li>
            <li><strong>Execution risk</strong> — brokerage outages or connectivity failures can delay or prevent order placement.</li>
            <li><strong>Backtest limitations</strong> — hypothetical results do not reflect actual trading and are labeled wherever shown.</li>
          </ul>
          <h2>Performance verification</h2>
          <p>
            Live performance is audited by an independent US CPA. Each strategy factsheet links to an
            independent audit record so you can verify results before subscribing.
          </p>
          <h2>Complaints</h2>
          <p>
            Write to <strong>info@squaredq.com</strong> with "Complaint" in the subject line. We
            acknowledge within 2 business days and aim to resolve within 30. If you are not satisfied,
            you may escalate to the relevant financial ombudsman or regulator in your jurisdiction.
          </p>
        </Prose>
      </PageSection>
    </PageShell>
  );
}
