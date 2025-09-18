import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const DisclaimerScreen = ({ onGoBack, onGoToPrivacyPolicy, onGoToTermsAndConditions }) => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800">
        <Button variant="ghost" size="icon" onClick={onGoBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Disclaimer</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 text-gray-300">
        <h2 className="text-2xl font-bold text-white mb-4">TaylorAI — AI Persona Disclaimer & Safety Notice</h2>
        <p className="text-sm text-gray-500 mb-6">Last updated: August 23, 2025</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">1) Nature of the Experience (Not the Real Person)</h3>
            <p>TaylorAI provides access to an <span className="font-bold">AI-generated persona</span> ("AI Taylor Swift"). The AI persona <span className="font-bold">is not the real Taylor Swift</span>, does not speak for her, and may produce responses that differ from the real person's views, personality, or statements. All conversations are simulated.</p>
            <p className="italic mt-2">AI Taylor Swift is created under license from Taylor Swift.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">2) Age Requirement</h3>
            <p>This app is intended <span className="font-bold">for adults 18+ (or the age of majority in your location)</span>. Do not use the app if you are a minor. We may implement age-gating and verification. By using the app, you confirm you meet the age requirement.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">3) Entertainment Only (No Advice)</h3>
            <p>Content is for <span className="font-bold">entertainment</span> and <span className="font-bold">informational</span> purposes <span className="font-bold">only</span>. The AI persona does <span className="font-bold">not</span> provide medical, mental-health, legal, financial, or other professional advice. Do not rely on responses for decisions that could affect your health, safety, finances, or legal rights. If you need advice, consult a qualified professional.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">4) AI Limitations & Content Quality</h3>
            <p>AI systems can generate <span className="font-bold">inaccurate, outdated, or offensive</span> outputs and may "hallucinate" facts. We do not guarantee the accuracy, completeness, or reliability of any content. You understand and accept these limitations.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">5) User Conduct & Prohibited Content</h3>
            <p>You agree <span className="font-bold">not</span> to use the app to:</p>
            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
              <li>Request, create, or share <span className="font-bold">illegal content</span>; <span className="font-bold">non-consensual</span> or exploitative content; or <span className="font-bold">content involving minors</span> (including role-play implying minors).</li>
              <li>Harass, threaten, dox, or exploit any person.</li>
              <li>Infringe intellectual-property or publicity/privacy rights.</li>
              <li>Attempt to identify or contact the real Taylor Swift using information from the AI persona.</li>
            </ul>
            <p className="mt-2">We may <span className="font-bold">filter, flag, or remove</span> content and may <span className="font-bold">suspend or terminate</span> access for violations. We may use a mix of automated and human moderation.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">6) Consent, Likeness, and IP Rights</h3>
            <p>All names, images, voice prints, brand elements, or likeness-adjacent features are used subject to applicable licenses or lawful exceptions. If you believe your rights are infringed, contact us at <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> with details. We will review and, where appropriate, <span className="font-bold">remove or disable</span> challenged content.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">7) Privacy & Data</h3>
            <p>We may process conversation data to operate, improve, and moderate the service as described in our <button onClick={onGoToPrivacyPolicy} className="font-bold text-blue-400 underline bg-transparent border-none cursor-pointer">Privacy Policy</button>. Do <span className="font-bold">not</span> share sensitive personal data in chats. Subject to law and our policy, transcripts may be retained for safety, auditing, and product improvement.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">8) Payments, Virtual Items, and Refunds</h3>
            <p>In-app purchases (including subscriptions or virtual items) are <span className="font-bold">licenses</span>, not property rights, and may be changed, limited, or revoked per our <button onClick={onGoToTermsAndConditions} className="font-bold text-blue-400 underline bg-transparent border-none cursor-pointer">Terms of Service</button>. Billing, renewal, and refund practices follow the platform rules and our posted policies.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">9) No Expectation of Human Interaction</h3>
            <p>Messages you receive in the app are <span className="font-bold">computer-generated</span>. There is <span className="font-bold">no guarantee</span> that a human will review, author, or oversee any specific response. Availability and response times are not guaranteed.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">10) Safety, Reporting, and Support</h3>
            <p>If content appears unsafe or violates these rules, please use the <span className="font-bold">Report</span> feature or contact <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a>. If you feel at risk of harm, contact local emergency services immediately.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">11) Disclaimers of Warranties; Limitation of Liability</h3>
            <p>The app and content are provided <span className="font-bold">"as is" and "as available."</span> To the fullest extent permitted by law, we disclaim all warranties (express or implied), and we will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages arising from use of the app, AI outputs, or third-party services.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">12) Third-Party Platforms & Services</h3>
            <p>Your use of app-store platforms, payment processors, model providers, or other third-party services is governed by <span className="font-bold">their</span> terms and privacy policies. We are not responsible for third-party acts or omissions.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">13) Changes to the Service and This Notice</h3>
            <p>We may update features, models, moderation tools, and this notice at any time. Material changes will be indicated by updating the "Last updated" date and, where required, additional notice.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">14) Governing Terms</h3>
            <p>This notice is part of and incorporated into our <button onClick={onGoToTermsAndConditions} className="font-bold text-blue-400 underline bg-transparent border-none cursor-pointer">Terms of Service</button>. If there is a conflict, the Terms of Service control. Venue, governing law, dispute resolution, and other legal provisions appear in the Terms.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">15) Contact</h3>
            <p><span className="font-bold">Mind Haven Corporation</span><br />
            <span className="font-bold">Address:</span> 410 Dunaway Drive, Valrico, FL 33594<br />
            <span className="font-bold">Email (legal/compliance):</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a><br />
            <span className="font-bold">Support:</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DisclaimerScreen; 