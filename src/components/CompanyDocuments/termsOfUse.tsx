import React from 'react';
import Link from 'next/link';

export const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-body py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-secondary" />

        <div className="p-8 md:p-16">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4 tracking-tight">
              Terms of Use
            </h1>
            <div className="flex items-center gap-3">
              <i className="text-sm font-accent text-muted-foreground uppercase tracking-widest not-italic">
                Last Updated: <span className="text-accent font-bold">August 28, 2024</span>
              </i>
            </div>
          </header>

          <div className="space-y-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            
            {/* Introductory Section */}
            <p>
              By accessing or using the 
              <Link href='/' className="text-primary font-bold hover:text-accent transition-colors px-1 underline decoration-primary/30 underline-offset-4"> website </Link> 
              and such other locations as made available from time to time (collectively, the “Website”) and the services offered through the Website, you (“you” and, together with all persons accessing or using the Website, collectively, the “Users”) signify that you have read, understand and agree to be bound by these Terms and Conditions (the “Terms and Conditions”) with RE/MAX Masters Realty and Sean Brawley Personal Real Estate Corporation (“us”, “we” or “our”), in all respects with respect to the Website.
            </p>

            {/* Warning Box - Using your Frosted Glass utility */}
            <div className="frosted-glass dark:frosted-glass-dark p-6 rounded-xl border border-primary/10 shadow-inner">
              <p className="font-display font-bold text-primary leading-snug uppercase text-sm tracking-wide">
                PLEASE READ THESE TERMS, CONDITIONS AND IMPORTANT INFORMATION REGARDING YOUR LEGAL RIGHTS, REMEDIES AND OBLIGATIONS. THESE INCLUDE, BUT ARE NOT LIMITED TO, VARIOUS LIMITATIONS AND EXCLUSIONS, AND INDEMNITIES.
              </p>
            </div>

            <p>
              Your use of the Website is subject to these Terms and Conditions. If you are not willing to be bound by each and every term or condition, or if any representation made herein by you is not true, you may not use and must cease using the Website.
            </p>

            <h2 className="text-xl font-display font-bold text-primary pt-8 border-t border-border uppercase tracking-widest">
              Terms and Conditions
            </h2>

            {/* Privacy Section */}
            <div>
              <p className="mb-4">
                <span className="font-bold text-foreground">Privacy</span>. 
                You acknowledge that you have read the
                <Link href='/privacyStatement' className="text-primary font-bold hover:text-accent transition-colors px-1 underline decoration-primary/30 underline-offset-4"> Privacy Statement </Link>, 
                as it may be updated from time to time (the &quot;Privacy Statement&quot;), and hereby consent to the collection, use, disclosure and retention by us of your personal information (whether previously collected or to be collected) for the purposes identified therein. You also consent to our use of such personal information in accordance with applicable terms and conditions contained in the Privacy Statement, which is incorporated herein by reference and forms an integral part of these Terms and Conditions.
              </p>
              
              <p>
                In accordance with the Rules of Cooperation of the Real Estate Board of Greater Vancouver (REBGV), and in conjunction with Privacy Policy, the User acknowledges understanding of and agreement with the following:
              </p>
            </div>

            {/* VOW Requirements List */}
            <ul className="space-y-4 pl-2">
              {[
                "The Registrant has received, read and understood the brochure published by the British Columbia Real Estate Association entitled “Privacy Notice and Consent”;",
                "all data obtained from the MLS® VOW is intended for and may only be used for the User’s personal, non-commercial use;",
                "the Registrant has a bona fide interest in the purchase, sale or lease of real estate of the type being offered through the MLS® VOW;",
                "the Registrant will not himself, and will not permit or assist others to, directly or indirectly:"
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start group">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}

              {/* Nested Circle List */}
              <ul className="pl-12 space-y-3 py-2">
                <li className="flex gap-3 items-center text-muted-foreground italic">
                  <span className="w-1 h-1 rounded-full border border-muted-foreground shrink-0" />
                  <span>copy, redistribute or retransmit any of the MLS® VOW Data or information provided;</span>
                </li>
                <li className="flex gap-3 items-center text-muted-foreground italic">
                  <span className="w-1 h-1 rounded-full border border-muted-foreground shrink-0" />
                  <span>display, post, disseminate, distribute, publish, broadcast, transfer, sell or sublicense any of the MLS® VOW Data to another person.</span>
                </li>
                <li className="flex gap-3 items-center text-muted-foreground italic">
                  <span className="w-1 h-1 rounded-full border border-muted-foreground shrink-0" />
                  <span>engage in Scraping (including “screen scraping” and “database scraping”), “data mining” or any other activity intended to collect, store, re-organize, summarize or manipulate any MLS® VOW Data or any related data;</span>
                </li>
              </ul>

              {[
                "the Registrant acknowledges the Board’s (REBGV) ownership of, and the validity of the Board’s proprietary rights and copyright in the MLS® VOW Data, and listing information; and",
                "the Registrant expressly authorizes the Board or their duly authorized representatives, to access the MLS® VOW and User’s information provided to the MLS® VOW Participant, for the purposes of verifying compliance with and pursuing enforcement of the Terms of Use and all applicable rules, regulations, bylaws, policies, and laws.",
                "Acknowledge and understand that the Terms of Use do not create an agency relationship and do not impose a financial obligation on the Registrant or create any representation agreement between the Registrant and the Participant;",
                "Acknowledge and enter into a lawful REALTOR®/ consumer or REALTOR®/client relationship with the Participant, including, where necessary, completion of any applicable agency, non-agency, and other disclosure obligations, and execution of any required agreements;"
              ].map((item, idx) => (
                <li key={idx + 4} className="flex gap-4 items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="font-accent text-xs uppercase tracking-widest text-muted-foreground bg-muted/30 p-4 rounded-lg border-l-2 border-accent italic">
              Understand that information on this site is deemed to be valid but is not guaranteed. It is the responsibility of the registrants to confirm all information on their own.
            </p>

            {/* Standard Clauses Section */}
            <div className="space-y-8 pt-6">
              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">Amendments to these Terms and Conditions</h3>
                <p>   We reserve the right to amend these Terms and Conditions at any time without notice to you, but we will use reasonable efforts to publish each amendment before such amendment becomes effective. We will ensure that the latest, fully amended version of these Terms and Conditions is published on the Terms and Conditions page. 
                You are responsible for regularly reviewing the Website to obtain timely notice of such amendments. If any amendment is unacceptable to you, you may terminate the agreement between you and us regarding the use of the Website as set out in these Terms and Conditions. If you continue to use the Website after the effective date of each amendment, you will be conclusively deemed to have accepted such an amended version of these Terms and Conditions.</p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">Legal Capacity</h3>
                <p>You represent and warrant that you possess the legal right, capacity and ability to agree to these Terms and Conditions and use the Website in accordance with them.If you are using the Website on behalf of a corporation or other organization, you represent and warrant that you have the ability to agree to these Terms and Conditions on behalf of such organization and all references to &quot;you&quot; throughout these Terms and Conditions will include such organization, jointly and severally with you personally.</p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-2 italic underline decoration-accent/20 underline-offset-8">License</h3>
                <p> We grant to you a non-exclusive, non-transferable, limited license only to use the Website, in accordance with the provisions set out in these Terms and Conditions. All rights not expressly granted to you in these Terms and Conditions are reserved by us and, if applicable, our licensors.</p>
              </section>

              {/* Account Section - Using Upper Alpha/Roman as requested */}
              <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Your Account and Account Use</h3>
                <p> If your use of the Website requires an account identifying you as a user of the Website (an &quot;Account&quot;), then,</p>
                <ol className="space-y-6 list-none pt-4">
                  <li className="pl-6 border-l-2 border-accent/20">
                    <span className="font-bold text-foreground block mb-2 underline decoration-accent/10">1. Responsibility</span>
                    <p className="text-sm">you are solely responsible for: (i) your Account and maintenance, confidentiality and security of your Account and all passwords related to your Account; and (ii) any and all activities that occur under your Account, including all activities of any persons who gain access to your Account with or without your permission.</p>
                  </li>
                  <li className="pl-6 border-l-2 border-accent/20">
                    <span className="font-bold text-foreground block mb-2 underline decoration-accent/10">2. Notification</span>
                    <p className="text-sm">you agree to immediately notify us, to the extent that you are or become aware, of (i) any unauthorized use of your Account, any service provided through your Account or any password related to your Account, or
                        (ii) any other breach of security with respect to your Account or any service provided through it, and you agree to provide assistance to us, as requested, to stop or remedy any breach of security related to your Account, and</p>
                  </li>
                  <li className="pl-6 border-l-2 border-accent/20">
                    <span className="font-bold text-foreground block mb-2 underline decoration-accent/10">3. Accuracy</span>
                    <p className="text-sm">you agree to provide true, current, accurate and complete customer information as requested by us from time to time and you agree to promptly notify us of any changes to this information as required to keep such information held by us current, complete and accurate.</p>
                  </li>
                </ol>
              </section>

                 <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Commercial Electronic Messages (&quot;CEMs&quot;)</h3>
                <p>The Website will only send CEMs, such as emails, in accordance with Canada&apos;s Anti-Spam Legislation (&quot;CASL&quot;).</p>

              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Third Party Websites</h3>
                <p> The Website (and associated apps) may contain links from other third-party websites and all such websites are independent. The Website has no control over these third-party websites and assumes no responsibility or obligations for such third-party websites. The provision of such links does not constitute any endorsement of such linked websites, their content or information appearing on the Website.</p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Website Limitations</h3>
                <p>The Website depends on the Internet, including networks, cabling, facilities and equipment that is not in our control; accordingly (i) any representation made by us regarding access performance, speeds, reliability, availability, use or consistency of the Website is on a &quot;commercially reasonable efforts&quot; basis, (ii) we cannot guarantee any minimum level regarding such performance, speed, reliability, availability, use or consistency, and (iii) data, messages, information or materials sent over the Internet may not be completely private, and your anonymity is not guaranteed.</p>

              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Copyright</h3>
                <p>Property listings and other data available on the Website are intended for private, non-commercial use by individuals. Any commercial use of the listings or data in whole or in part, directly or indirectly, is specifically forbidden except with the prior written authority of the owner of the copyright. Prohibited uses include &quot;screen scraping,&quot; &quot;database scraping,&quot; and any other activities intended to collect, store, reorganize or publish data on the pages produced by, or displayed by the Website or associated apps. REALTOR® is a certification mark owned by REALTOR® Canada Inc., a corporation owned by the National Association of REALTORS® and CREA. Multiple Listing Service® is a registered certification mark owned by CREA and used to identify real estate services provided by brokers and salespersons who are members of CREA.</p>
              </section>

              <section>
                <h3 className="font-display font-bold text-primary mb-4 italic underline decoration-accent/20 underline-offset-8">Disclaimer</h3>
                <p>We make no representations about the suitability of the data, information, or graphics published on this site. Everything on this site is provided &quot;As Is&quot; and &quot;As Available&quot; without warranty of any kind. Neither REALTOR®, RE/MAX Masters Realty or Sean Brawley Personal Real Estate Corp, nor any of its members, directors, officer, shareholders or affiliates shall be liable for any direct, incidental, consequential, indirect or punitive damages arising out of your access to or use of this site.</p>
              </section>

              {/* Proprietary Rights - Alpha List */}
              <section className="space-y-6 pt-10 border-t border-border">
                <h2 className="text-xl font-display font-bold text-primary uppercase tracking-widest">Proprietary Rights</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="font-display font-bold text-accent">A.</span>
                    <p><span className="font-bold text-foreground">Content</span>—&quot;Content&quot; means all materials and content, including designs, editorial, text, graphics, audiovisual materials, multimedia elements, photographs, videos, music, sound recordings, reports, documents, software, information, formulae, patterns, data and any other work.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-display font-bold text-accent">B.</span>
                    <p><span className="font-bold text-foreground">Third-Party Content</span>—Content accessed or available through the Website or the Internet may be owned by parties other than you or us (collectively, &quot;Third Party Content&quot;) and may be protected by applicable copyrights, trademarks, patents, trade secrets or other proprietary rights and laws. Nothing in your use of the Website or these Terms and Conditions grants you any right, title or interest in or to this Third-Party Content except for the limited right to use the Website as set out in these Terms and Conditions.</p>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-display font-bold text-accent">C.</span>
                    <div className="space-y-4">
                      <p><span className="font-bold text-foreground">Your Content—</span> We do not claim ownership of any Content that you post, upload, input, provide, submit or otherwise transmit to us, or any third party, using the Website (collectively, &quot;Your Content&quot;); however, you agree that by posting, uploading, inputting, providing, submitting, entering or otherwise transmitting your Content to us or any third party using the Website,</p>
                      <ol className="space-y-3 py-2">
                        <li><i>(i) License to Us</i> —You have thereby granted us a royalty-free, non-exclusive, worldwide, fully paid-up limited license to use, copy, distribute, transmit, display, edit, delete, publish and translate Your Content to the extent reasonably required by us to provide the Website to our customers or to ensure adherence to or enforce the terms of these Terms and Conditions,</li>
                        <li><i>(ii) Your Warranty to Us</i> —You will have thereby confirmed, represented and warranted to us that you have all rights, titles and interests, as well as the power and authority necessary, to grant the license to Your Content set out above, and</li>
                        <li><i>(iii) Your Indemnity of Us</i> —You will indemnify and save us harmless from and against any liabilities, actions, proceedings, claims, causes of action, demands, debts, losses, damages, charges and costs. </li>
                    </ol>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-display font-bold text-accent">D.</span>
                    <p><span className="font-bold text-foreground">Advertising</span>—We will have the right, without notice, to insert advertising data into the Website, so long as this does not involve our transmission of any of your personal information in contravention of our Privacy Statement.</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Professional Footer Accent */}
        <footer className="bg-muted/30 py-8 px-8 border-t border-border text-center">
          <p className="font-accent text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
            © {new Date().getFullYear()} Sean Brawley Personal Real Estate Corp
          </p>
        </footer>
      </div>
    </div>
  );
}