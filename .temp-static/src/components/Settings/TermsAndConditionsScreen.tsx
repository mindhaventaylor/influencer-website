import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const TermsAndConditionsScreen = ({ onGoBack, onGoToPrivacyPolicy }) => {
  return (
    <div className="flex flex-col h-screen-mobile bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800">
        <Button variant="ghost" size="icon" onClick={onGoBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Terms & Conditions</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 text-gray-300">
        <h2 className="text-2xl font-bold text-white mb-4">TaylorAI — Terms & Conditions</h2>
        <p className="text-sm text-gray-500 mb-6">Effective Date: August 23, 2025</p>
        <p className="mb-2"><span className="font-bold">Company:</span> Mind Haven Corporation, 410 Dunaway Drive, Valrico, FL 33594 ("<span className="font-bold">Company</span>," "<span className="font-bold">we</span>," "<span className="font-bold">us</span>," "<span className="font-bold">our</span>")</p>
        <p className="mb-2"><span className="font-bold">Legal/Compliance:</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>
        <p className="mb-6"><span className="font-bold">Support:</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>
        
        <p className="mb-6">These Terms & Conditions ("<span className="font-bold">Terms</span>") are a binding agreement between you and Company. By accessing or using <span className="font-bold">TaylorAI</span>, our websites, apps, and related services (collectively, the "<span className="font-bold">Service</span>"), you agree to these Terms and our <button onClick={onGoToPrivacyPolicy} className="font-bold text-blue-400 underline bg-transparent border-none cursor-pointer">Privacy Policy</button>. If you do not agree, do not use the Service.</p>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white mb-2">1) Eligibility & Age Requirements</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><span className="font-bold">18+ only.</span> You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service.</li>
            <li>We may implement <span className="font-bold">age verification</span> and deny/terminate access if verification fails or is refused.</li>
            <li>You are responsible for complying with local laws; the Service may not be available in some locations.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">2) Nature of the Service (AI Persona; Not the Real Person)</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The Service features <span className="font-bold">AI-generated personas</span>, including "<span className="font-bold">AI Taylor Swift</span>." Responses are <span className="font-bold">computer-generated</span> and may be inaccurate, offensive, or inconsistent with real individuals.</li>
            <li>Where applicable, personas are provided <span className="font-bold">under license</span> or as otherwise permitted by law. <span className="font-bold">AI Taylor Swift is not the real Taylor Swift</span> and does not speak for her.</li>
            <li><span className="font-bold">No professional advice.</span> Content is for entertainment/information only and is not medical, mental-health, legal, or financial advice.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">3) Accounts & Security</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Keep your registration information accurate; keep your credentials confidential.</li>
            <li>You are responsible for all activity under your account. Notify <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> immediately of unauthorized use.</li>
            <li>We may require multi-factor authentication or other security steps.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">4) User Conduct & Prohibited Content</h3>
          <p>You agree not to use the Service to create, request, upload, share, or promote:</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li><span className="font-bold">Illegal content</span> or activities; <span className="font-bold">sexual content involving minors</span> (including role-play implying minors), <span className="font-bold">non-consensual</span> or exploitative sexual content, bestiality, trafficking, threats, or harassment.</li>
            <li>Content that infringes <span className="font-bold">intellectual-property</span>, <span className="font-bold">privacy</span>, or <span className="font-bold">publicity</span> rights.</li>
            <li>Attempts to identify, contact, impersonate, or defame the real person behind any AI persona, or to obtain their personal information.</li>
            <li>Malicious code, scraping, reverse engineering (except where legally permitted), or service abuse (spam, fraud, bots).</li>
          </ul>
          <p className="mt-2">We may <span className="font-bold">filter, restrict, remove</span>, and/or <span className="font-bold">suspend or terminate</span> accounts for violations. We use automated and human moderation (see <span className="font-bold">Community Guidelines</span> below).</p>

          <h3 className="text-lg font-semibold text-white mb-2">5) User Content & License to Company</h3>
           <ul className="list-disc list-inside pl-4 space-y-1">
              <li>You retain ownership of content you submit ("<span className="font-bold">User Content</span>").</li>
              <li>You grant Company a <span className="font-bold">worldwide, non-exclusive, royalty-free, sublicensable, transferable license</span> to host, store, reproduce, adapt, translate, distribute, display, perform, and otherwise use your User Content <span className="font-bold">to operate, improve, promote, and secure the Service</span>, including moderation and safety.</li>
              <li>You represent and warrant that you have the rights to grant this license and that your User Content complies with these Terms and applicable law.</li>
              <li>Upon deletion of User Content or account closure, we will cease public display within a reasonable period, subject to backups, legal holds, fraud prevention, and safety obligations.</li>
           </ul>

          <h3 className="text-lg font-semibold text-white mb-2">6) AI Outputs; Feedback</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>AI chat <span className="font-bold">outputs</span> may be imperfect or harmful if misused; use discretion and report issues.</li>
            <li>If you provide <span className="font-bold">feedback</span> or suggestions, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use them without restriction or compensation.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">7) Intellectual Property; Persona & Brand Rights</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>The Service (software, models, designs, text, images, trademarks, and logos) is owned by Company or its licensors and protected by law.</li>
            <li>Any referenced names, images, voices, or likeness-adjacent features are used under license or as otherwise permitted by law.</li>
            <li>If you believe your rights are infringed, email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> (see Section 13).</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">8) Purchases, Subscriptions, Tips & Virtual Items</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><span className="font-bold">Billing via platform.</span> Purchases/subscriptions may be processed by Apple App Store, Google Play, or other platforms and are subject to their terms.</li>
            <li><span className="font-bold">Auto-renewal.</span> Subscriptions <span className="font-bold">auto-renew</span> until cancelled. Cancel in your platform account settings before renewal to avoid future charges.</li>
            <li><span className="font-bold">Trials/Promos.</span> Trials convert to paid unless cancelled before the trial ends.</li>
            <li><span className="font-bold">Virtual items/tokens/credits</span> are licensed, have no cash value, are non-transferable, and are generally <span className="font-bold">non-refundable</span> except where required by law or platform policy.</li>
            <li>We may change features, pricing, and availability with prospective effect.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">9) Refund Policy (Included)</h3>
          <p><span className="font-bold">Where you purchased through Apple or Google:</span> Refunds are governed by the platform's rules and must be requested through the platform. We do not control those determinations.</p>
          <p className="mt-2"><span className="font-bold">Where permitted and purchased directly from us (if offered):</span></p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li><span className="font-bold">Subscriptions:</span> Cancel anytime; cancellation stops future renewals but <span className="font-bold">does not</span> grant refunds for the current billing period, except where required by law.</li>
            <li><span className="font-bold">Trials/Intro Offers:</span> If you cancel before the trial ends, you will not be charged. Conversions are non-refundable once billed.</li>
            <li><span className="font-bold">Duplicate/Accidental charges:</span> Contact <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> within 14 days; we may issue a discretionary refund if the benefits were not meaningfully used.</li>
            <li><span className="font-bold">Fraud or unauthorized use:</span> We may suspend the account, reverse benefits, and require proof before issuing any credit.</li>
          </ul>
          <p className="mt-2">Nothing in this policy limits any <span className="font-bold">non-waivable</span> statutory rights.</p>
          
          <h3 className="text-lg font-semibold text-white mb-2">10) Privacy & Data</h3>
          <p>Our collection and use of personal data are described in the <button onClick={onGoToPrivacyPolicy} className="font-bold text-blue-400 underline bg-transparent border-none cursor-pointer">Privacy Policy</button>. Do not share sensitive data in chats. We may <span className="font-bold">review and retain</span> conversations for safety, moderation, fraud prevention, compliance, and to improve the Service as described in the Privacy Policy.</p>
          
          <h3 className="text-lg font-semibold text-white mb-2">11) Safety, Reporting & Blocking</h3>
          <p>Use in-app tools or email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> to <span className="font-bold">report</span> content or <span className="font-bold">block</span> accounts/personas. We may act at our discretion but do not guarantee removal timelines. If you believe there is an immediate risk of harm, contact <span className="font-bold">local emergency services</span>.</p>
          
          <h3 className="text-lg font-semibold text-white mb-2">12) Disclaimers; Limitation of Liability</h3>
          <p>THE SERVICE IS PROVIDED <span className="font-bold">"AS IS" AND "AS AVAILABLE."</span> TO THE FULLEST EXTENT PERMITTED BY LAW, COMPANY AND ITS PROVIDERS DISCLAIM ALL WARRANTIES (EXPRESS, IMPLIED, OR STATUTORY), INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          <p className="mt-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMPANY WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOSS OF PROFITS, DATA, OR GOODWILL; OR SERVICE INTERRUPTIONS, EVEN IF ADVISED OF THE POSSIBILITY.</p>
          <p className="mt-2">OUR AGGREGATE LIABILITY FOR CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF <span className="font-bold">(A) AMOUNTS YOU PAID TO COMPANY IN THE 12 MONTHS BEFORE THE CLAIM</span> OR <span className="font-bold">(B) USD $100.</span> Some jurisdictions do not allow certain limitations; portions may not apply.</p>
          
          <h3 className="text-lg font-semibold text-white mb-2">13) Copyright/Right-of-Publicity Complaints (DMCA/Notice)</h3>
          <p>Email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> with: (a) your contact info; (b) description and location (URL or in-app path) of the material; (c) a statement of good-faith belief the use is unauthorized; (d) a statement under penalty of perjury that your notice is accurate and you are authorized; and (e) a physical or electronic signature. We may notify the user and, where appropriate, remove or disable access and/or terminate repeat infringers.</p>

          <h3 className="text-lg font-semibold text-white mb-2">14) Third-Party Services & Links</h3>
          <p>The Service may integrate third-party services (e.g., payment processors, app stores, model providers). Their terms and privacy policies govern your use of those services. We are not responsible for third-party acts or omissions.</p>

          <h3 className="text-lg font-semibold text-white mb-2">15) Geographic Restrictions; Export & Sanctions</h3>
          <p>You may not use the Service where prohibited by law, including in jurisdictions subject to comprehensive <span className="font-bold">U.S. embargoes or sanctions</span>. You must comply with <span className="font-bold">export control</span> laws and may not use the Service for prohibited end uses.</p>

          <h3 className="text-lg font-semibold text-white mb-2">16) Termination</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>You may stop using the Service or request account deletion at any time by emailing <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a>.</li>
            <li>We may suspend or terminate access (with or without notice) for any reason, including violations, risk, non-payment, or legal requirements.</li>
            <li>Sections intended to survive termination (e.g., 5–7, 9, 12–21, 23) will survive.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">17) Changes to the Service or Terms</h3>
          <p>We may modify the Service and these Terms. <span className="font-bold">Material changes</span> will be indicated by updating the Effective Date and, where required, by additional notice. Your continued use after changes take effect constitutes acceptance.</p>

          <h3 className="text-lg font-semibold text-white mb-2">18) Dispute Resolution; Arbitration; Class-Action Waiver (U.S.)</h3>
          <p className="font-bold">Please read carefully.</p>
          <p className="mt-2">To the extent permitted by law:</p>
          <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
            <li><span className="font-bold">Informal Resolution.</span> Contact <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> first; we'll try to resolve within <span className="font-bold">30 days</span>.</li>
            <li><span className="font-bold">Arbitration.</span> Any dispute arising out of or relating to these Terms or the Service will be resolved by <span className="font-bold">binding arbitration</span> administered by the <span className="font-bold">American Arbitration Association (AAA)</span> under its rules. Venue: <span className="font-bold">Wilmington, Delaware</span>. Language: English.</li>
            <li><span className="font-bold">Class Waiver.</span> Disputes must be brought <span className="font-bold">individually</span>; no class or representative actions.</li>
            <li><span className="font-bold">Exceptions.</span> You may bring claims in <span className="font-bold">small-claims court</span> if eligible or seek <span className="font-bold">injunctive relief</span> for IP misuse.</li>
            <li><span className="font-bold">30-Day Opt-Out.</span> You may opt out of arbitration within 30 days of account creation by emailing <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> with your account details and a clear statement opting out.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">19) Platform-Specific Terms</h3>
          <p><span className="font-bold">Apple iOS.</span> You acknowledge: (a) these Terms are between you and Company, not Apple; (b) Apple has no responsibility for the app or its content; (c) your use complies with the <span className="font-bold">App Store Terms</span>; (d) Apple is a third-party beneficiary of these Terms and may enforce them; (e) Apple has no warranty/maintenance obligations beyond any required refund.</p>
          <p className="mt-2"><span className="font-bold">Google Play.</span> Your use must comply with the <span className="font-bold">Google Play Terms</span>.</p>
          <p className="mt-2">If platform terms conflict with these Terms, <span className="font-bold">platform terms control</span> for billing and distribution.</p>

          <h3 className="text-lg font-semibold text-white mb-2">20) Accessibility</h3>
          <p>We strive to make the Service accessible. If you encounter barriers, contact <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a>.</p>

          <h3 className="text-lg font-semibold text-white mb-2">21) Governing Law & Venue</h3>
          <p>These Terms are governed by the laws of <span className="font-bold">Delaware, USA</span>, excluding conflict-of-law rules. Venue for any <span className="font-bold">non-arbitrable</span> claims is <span className="font-bold">Wilmington, Delaware</span>.</p>

          <h3 className="text-lg font-semibold text-white mb-2">22) Miscellaneous</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li><span className="font-bold">Severability:</span> If any provision is unenforceable, the remainder remains in effect.</li>
            <li><span className="font-bold">Assignment:</span> You may not assign these Terms; we may assign them in connection with a merger, sale, or reorganization.</li>
            <li><span className="font-bold">Entire Agreement:</span> These Terms and the Privacy Policy, Community Guidelines (below), and any posted policies are the entire agreement between you and Company.</li>
            <li><span className="font-bold">No Waiver:</span> Failure to enforce a provision is not a waiver.</li>
            <li><span className="font-bold">Headings:</span> For convenience only.</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">23) Community Guidelines (Included)</h3>
          <p>These Guidelines apply to all use of the Service and examples are <span className="font-bold">illustrative, not exhaustive</span>. Violations may result in content removal, feature limits, suspension, or termination.</p>
          <ol className="list-decimal list-inside pl-4 mt-2 space-y-1">
            <li><span className="font-bold">18+ only.</span> No minors in any context; no role-play <span className="font-bold">implying</span> minors.</li>
            <li><span className="font-bold">Consent.</span> No non-consensual or exploitative sexual content; no encouragement of abuse, self-harm, or violence.</li>
            <li><span className="font-bold">Legal compliance.</span> No illegal activity, trafficking, threats, or solicitation of real-world sexual services.</li>
            <li><span className="font-bold">Respect & safety.</span> No harassment, doxxing, hate, or credible threats.</li>
            <li><span className="font-bold">Privacy & identity.</span> Do not attempt to identify, contact, or impersonate real persons behind AI personas.</li>
            <li><span className="font-bold">IP rights.</span> Do not upload or request content that infringes copyrights, trademarks, or publicity rights.</li>
            <li><span className="font-bold">No circumvention.</span> Do not attempt to bypass age-gates, filters, rate limits, or security.</li>
            <li><span className="font-bold">Quality & honesty.</span> No scams, spam, or deceptive conduct.</li>
            <li><span className="font-bold">Reporting.</span> Use in-app tools or email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> to report violations or unsafe content.</li>
            <li><span className="font-bold">Enforcement.</span> We may use automated and human review. We act at our discretion and may notify authorities if required by law.</li>
          </ol>

          <h3 className="text-lg font-semibold text-white mb-2">Contact Us</h3>
          <p>Mind Haven Corporation • 410 Dunaway Drive, Valrico, FL 33594</p>
          <p>Legal/Compliance & Support: <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsScreen;
