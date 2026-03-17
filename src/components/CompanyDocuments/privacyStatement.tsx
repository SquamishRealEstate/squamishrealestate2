import React from "react";
import Link from "next/link";

export const PrivacyStatement = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-body py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="p-8 md:p-16">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <div className="flex items-center gap-3">
              <i className="text-sm font-accent text-muted-foreground uppercase tracking-widest not-italic">
                Organization:{" "}
                <span className="text-accent font-bold">BCREA</span>
              </i>
            </div>
          </header>

          <div className="space-y-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            {/* Introductory Section */}
            <p>
              To help you sell, buy or lease real estate, <b>REALTORS®</b>,
              brokerages and real estate boards need to collect, use and
              disclose some of your personal information. This form provides you
              with information about, and obtains your consent to, such
              information handling practices.
            </p>

            <h2 className="text-xl font-display font-bold text-primary pt-8 border-t border-border uppercase tracking-widest">
              Definitions
            </h2>

            <div className="frosted-glass dark:frosted-glass-dark p-6 rounded-xl border border-primary/10 shadow-inner space-y-4">
              <p>
                <span className="font-bold text-primary">
                  Personal Information
                </span>{" "}
                may include information about your property (such as listing and
                selling price, lease rate, listing term, etc.).
              </p>
              <p>
                A <span className="font-bold text-primary">REALTOR®</span> is a
                member of a real estate board, the British Columbia Real Estate
                Association (BCREA) and of The Canadian Real Estate Association
                (CREA). REALTORS® in BC are licensed under the Real Estate
                Services Act.
              </p>
              <p>
                <span className="font-bold text-primary">Brokerage</span> refers
                to the real estate company where your REALTOR® is licensed.
              </p>
              <p>
                The <span className="font-bold text-primary">boards</span> are
                British Columbia real estate boards that are members of BCREA.
                REALTORS® provide MLS® services, which are professional to
                effect the purchase and sale of real estate as part of a
                co-operative selling system, otherwise known as an MLS® System.
              </p>
              <p>
                An <span className="font-bold text-primary">MLS® System</span>{" "}
                is a member-to-member cooperative selling system for the
                purchase, sale or lease of real estate that is owned or
                controlled by a board, includes an inventory of listings of
                participating REALTORS®, and ensures a certain level of accuracy
                of information, professionalism, and cooperation amongst
                REALTOR® members.
              </p>
            </div>

            {/* Information Collection Sections */}
            <div className="space-y-8 pt-6">
              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">
                  How is my personal information collected?
                </h3>
                <p>
                  Most personal information will be collected directly from you
                  through the contracts and other documents you fill out (e.g.
                  Multiple Listing Contract, Contract of Purchase and Sale,
                  Offer to Lease, seller’s Property Disclosure Statement) and
                  through discussions you have with the REALTOR® to whom you are
                  giving this consent. Some information may be collected from
                  other sources such as government departments and agencies
                  (e.g. Land Titles Offices, BC Assessment) financial
                  institutions and mortgage brokers.
                </p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">
                  To whom may my personal information be disclosed?
                </h3>
                <p>
                  Your information may be disclosed to (or may be accessible by)
                  the board and their staff and members, other REALTORS® and
                  their clients, government departments and agencies, financial
                  institutions, legal advisors, service providers, BCREA, the
                  Real Estate Council of British Columbia (RECBC), CREA and
                  members of the public, for the purposes described below.
                </p>
                <p className="mt-4 text-sm italic text-muted-foreground">
                  Not all of your information will be accessible to each of the
                  abovementioned entities. For example, once the listing term
                  has ended, the general public will not have access to your
                  information, unless it is otherwise available through public
                  registries or publications (e.g., Land Title Offices, BC
                  Assessment, Realtor.ca)
                </p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">
                  Why is my personal information collected, used and disclosed?
                </h3>
                <p className="mb-6">
                  Your personal information may be collected, used and disclosed
                  for some or all of the primary uses set out below. These
                  primary uses are a necessary part of your relationship with
                  the REALTOR® to whom you are giving this consent.
                </p>

                <ul className="space-y-4 pl-2">
                  {[
                    "To list/market your property on the MLS® System in accordance with the terms and conditions of the MLS® System and the boards.",
                    "To allow members of real estate boards (including REALTORS® and appraisers) to value your property.",
                    "To market your property through any other media (both print and electronic).",
                    "To help you locate a suitable property to buy or lease.",
                    "To facilitate the purchase and sale or lease transaction both before and after the completion of your transaction or entering into a lease (including by cooperating with financial institutions, legal advisors, government departments and agencies and third parties engaged in connection with the purchase and sale or lease transaction, such as photographers, appraisers and other service providers, and by communicating with you to coordinate any of the foregoing or to ensure your satisfaction with any of the foregoing and the real estate services provided to you in connection with the transaction).",
                    "To allow the boards (including REALTORS®) to compile current and historical statistics on sales and property prices and lease rates, and to conduct comparative market analyses. Information about your property will be retained in the MLS® System and handled in accordance with its and the boards’ terms and conditions and published by the boards from time to time for these purposes after your property has sold or leased or your listing has expired (if you are a seller / landlord) and after you have purchased or leased your property (if you are a buyer / tenant).",
                    "To enforce codes of professional conduct and ethics for REALTORS® (by cooperating with the boards, BCREA, RECBC, CREA and other regulatory bodies).",
                    "To comply with legal requirements and to act pursuant to legal authorizations.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4 items-start group">
                      <span className="font-display font-bold text-accent shrink-0 w-4">
                        {idx + 1}.
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="pt-10 border-t border-border">
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">
                  Will my personal information be collected, used and disclosed
                  for any other purposes?
                </h3>
                <p className="mb-6">
                  Your personal information may also be collected, used and
                  disclosed for the secondary uses set out below. These
                  secondary uses are optional. If you do not want your personal
                  information used or disclosed for any of these secondary uses,
                  you may opt out of granting consent.
                </p>

                <ol className="space-y-6 list-none pt-4">
                  {[
                    "The REALTOR® to whom you are giving this consent (or their brokerage) may communicate with you in the future to determine whether you require additional real estate services.",
                    "The REALTOR® to whom you are giving this consent (or their brokerage) may communicate with you to provide information about other products or services that may interest you.",
                    "Other REALTORS® may communicate with you to determine if you require additional real estate services.",
                    "The boards, and other REALTORS® or their brokerage (and survey firms on their behalf) may communicate with you to participate in surveys.",
                  ].map((item, idx) => (
                    <li key={idx} className="pl-6 border-l-2 border-accent/20">
                      <span className="font-bold text-foreground block mb-2 underline decoration-accent/10">
                        Secondary Use {idx + 1}
                      </span>
                      <p className="text-sm">{item}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="font-accent text-xs uppercase tracking-widest text-muted-foreground bg-muted/30 p-6 rounded-lg border-l-2 border-accent italic mt-8">
                <p className="mb-4">
                  You may withdraw your consent to any or all of the secondary
                  uses in the future by contacting the REALTOR® to whom you are
                  giving this consent or that REALTOR’s Board’s privacy officer.
                </p>
                <p>
                  Contact information for all boards can be obtained from BCREA
                  (website{" "}
                  <a
                    href="http://www.bcrea.bc.ca"
                    className="text-primary hover:text-accent underline"
                  >
                    www.bcrea.bc.ca
                  </a>{" "}
                  or telephone 604.683.7702).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer Accent */}
        <footer className="bg-muted/30 py-8 px-8 border-t border-border text-center">
          <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
            © {new Date().getFullYear()} British Columbia Real Estate
            Association
          </p>
        </footer>
      </div>
    </div>
  );
};
