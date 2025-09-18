import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

const PrivacyPolicyScreen = ({ onGoBack }) => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex items-center p-4 border-b border-gray-800">
        <Button variant="ghost" size="icon" onClick={onGoBack} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6 text-gray-300">
        <h2 className="text-2xl font-bold text-white mb-4">TaylorAI — Privacy Policy</h2>
        <p className="text-sm text-gray-500 mb-6">Last updated: August 23, 2025</p>
        <p className="mb-2"><span className="font-bold">Company:</span> Mind Haven Corporation, 410 Dunaway Drive, Valrico, FL 33594</p>
        <p className="mb-6"><span className="font-bold">Contact:</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>
        
        <p className="mb-6">This Privacy Policy explains what we collect, why we collect it, who we share it with, and the choices you have. If you don’t agree with it, please don’t use TaylorAI.</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">1) Who can use TaylorAI</h3>
            <p>TaylorAI is <span className="font-bold">for adults 18+</span>. We don’t knowingly collect data from anyone under 18. If we learn a user is under 18, we’ll delete the account and related data.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">2) What we collect</h3>
            <p>We collect only what we need to run and improve TaylorAI:</p>
            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
              <li><span className="font-bold">Account info:</span> email, username, password, age confirmation, settings.</li>
              <li><span className="font-bold">Chats & content:</span> your messages with the AI, any images you upload, ratings/feedback. (Chats may include sensitive topics you choose to share.)</li>
              <li><span className="font-bold">Purchases:</span> subscription status and transaction metadata from the app store. We don’t store full payment card numbers.</li>
              <li><span className="font-bold">Age verification (if enabled):</span> results from a verification vendor (e.g., pass/fail, date of birth confirmation). We do not keep biometric templates.</li>
              <li><span className="font-bold">Device & usage:</span> app version, device type, language, crash logs, feature usage, IP-based <span className="font-bold">approximate</span> location (for safety, fraud prevention, and localization).</li>
              <li><span className="font-bold">Support:</span> messages you send to our support email and any attachments.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">3) How we use your information</h3>
            <p>We use your information to:</p>
            <ol className="list-decimal list-inside pl-4 mt-2 space-y-1">
              <li><span className="font-bold">Provide the service</span> — create your account, run the AI chat, process purchases, and offer support.</li>
              <li><span className="font-bold">Keep TaylorAI safe</span> — age-gating, moderation (automated and human review), spam/fraud prevention, enforcing our Terms.</li>
              <li><span className="font-bold">Improve TaylorAI</span> — fix bugs, analyze features people use, and make the product better.</li>
              <li><span className="font-bold">Communicate with you</span> — transactional emails (receipts, service updates). You can opt out of any non-essential marketing emails.</li>
            </ol>
            <p className="mt-2"><span className="font-bold">Model training:</span> We do <span className="font-bold">not</span> use your chats to train <span className="font-bold">public</span> AI models. If we ever offer an optional setting to help improve <span className="font-bold">our</span> models, it will be clearly labeled and you can opt out.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">4) Who we share information with</h3>
            <p>We do not sell your personal information.</p>
            <p className="mt-2">We share information only with:</p>
            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
              <li><span className="font-bold">Service providers</span> that help us operate TaylorAI (cloud hosting, analytics, crash reporting, customer support, email delivery).</li>
              <li><span className="font-bold">AI/model providers</span> to generate responses and for safety checks (they act as our processors and must protect the data).</li>
              <li><span className="font-bold">Age-verification vendor</span> to confirm you are 18+ (we receive pass/fail and limited metadata).</li>
              <li><span className="font-bold">App stores/payment processors</span> (Apple, Google, etc.) to process purchases.</li>
              <li><span className="font-bold">Authorities or others</span> when required by law, to protect safety, or during a business transaction (e.g., merger or asset sale).</li>
            </ul>
            <p className="mt-2">These partners can only use your data to provide services to us and must keep it secure.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">5) Your choices & rights</h3>
            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
              <li><span className="font-bold">Access/Download/Correct/Delete:</span> Email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> and we’ll help with your request. We’ll verify it’s you for safety.</li>
              <li><span className="font-bold">Marketing:</span> If we send marketing emails, you can opt out anytime using the link in the email.</li>
              <li><span className="font-bold">State/Regional rights:</span> If your local law gives you extra rights (e.g., California, EEA/UK), we honor them. Tell us your location in your request so we can handle it correctly.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">6) Retention (how long we keep data)</h3>
            <p>We keep information only as long as needed:</p>
            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                <li><span className="font-bold">Account info:</span> as long as your account is active (and for a short period after deletion for safety/legal reasons).</li>
                <li><span className="font-bold">Chats:</span> kept until you delete them or your account; limited safety backups may remain for a short time.</li>
                <li><span className="font-bold">Logs/analytics:</span> typically around <span className="font-bold">90–180 days</span>.</li>
                <li><span className="font-bold">Purchase records:</span> up to <span className="font-bold">7 years</span> (tax/accounting rules).</li>
                <li><span className="font-bold">Age-verification records:</span> minimal info for compliance, kept for a limited period.</li>
            </ul>
            <p className="mt-2">We may keep <span className="font-bold">de-identified</span> data for product safety, stats, and research.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">7) Security</h3>
            <p>We use reasonable security measures (encryption in transit, access controls, logging). No system is 100% secure. If you believe your account was accessed without permission, email <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a> immediately.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">8) International data transfers</h3>
            <p>We may process data in countries other than where you live. When we transfer data, we use appropriate safeguards (for example, standard contractual clauses) to protect it.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">9) Third-party links</h3>
            <p>If TaylorAI links to other sites or services, their privacy policies apply to what you do there.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">10) Changes to this policy</h3>
            <p>If we make material changes, we’ll update the “Last updated” date and, when appropriate, provide a notice in the app or by email. Your continued use of TaylorAI means you accept the updated policy.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">11) Contact us</h3>
            <p><span className="font-bold">Mind Haven Corporation</span><br />
            410 Dunaway Drive, Valrico, FL 33594<br />
            <span className="font-bold">Privacy & Support:</span> <a href="mailto:company@mindhavenus.com" className="text-blue-400 underline">company@mindhavenus.com</a></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
