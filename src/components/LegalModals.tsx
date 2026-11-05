import React from 'react';
import { X, ShieldCheck, FileText, Mail, Send, Check } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = React.useState(false);
  const [contactMessage, setContactMessage] = React.useState('');

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f1018] border border-white/10 shadow-[0_0_50px_rgba(229,9,20,0.25)] p-6 sm:p-8 my-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* PRIVACY POLICY */}
        {type === 'privacy' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-black text-white">MovieDuniya Privacy Policy</h3>
            </div>

            <p>
              Your privacy is of utmost importance to MovieDuniya. This Privacy Policy outlines how your personal data, payment information, and streaming activities are securely handled.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">1. Information We Collect</h4>
            <p>
              We collect user account information (such as your name and email address) and payment verification receipts generated through authorized gateways including JazzCash, Easypaisa, debit/credit cards, and bank transfers.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">2. Payment Security</h4>
            <p>
              All payment transactions are encrypted with 256-bit SSL encryption. We do not store your MPIN, bank passwords, or sensitive CVV codes on our servers.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">3. Content &amp; Distribution Rights</h4>
            <p>
              MovieDuniya respects intellectual property. All streamed movies and media are licensed, distributed with permission, or uploaded under authorized publisher agreements.
            </p>
          </div>
        )}

        {/* TERMS & CONDITIONS */}
        {type === 'terms' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs text-zinc-300 leading-relaxed">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-black text-white">MovieDuniya Terms &amp; Conditions</h3>
            </div>

            <p>
              Welcome to MovieDuniya. By subscribing or using our streaming services, you agree to comply with and be bound by the following terms.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">1. Subscription Plans &amp; Billing</h4>
            <p>
              MovieDuniya offers Monthly (Rs. 199), 3 Months (Rs. 499), and 1 Year (Rs. 2,999) streaming memberships. Access to VIP content requires an active confirmed subscription.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">2. Authorized Distribution Policy</h4>
            <p>
              Only administrators with authorized distribution rights or legitimate ownership are permitted to upload films, web series, and promotional media to the platform. Unauthorized copying or redistribution is strictly prohibited.
            </p>

            <h4 className="text-sm font-bold text-white pt-2">3. Multi-Device HD Playback</h4>
            <p>
              Subscribers may stream on supported phones, tablets, laptops, and connected TVs. Playback quality adapts to your network speed up to 4K Ultra HD.
            </p>
          </div>
        )}

        {/* CONTACT US */}
        {type === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-black text-white">Contact MovieDuniya Support</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Need help with your subscription, payment verification, or movie uploads? Our 24/7 support team is here to assist.
            </p>

            {contactSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-white">Message Received!</h4>
                <p className="text-xs text-zinc-300">
                  Our customer service representative will reply to your registered email within 2 hours.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Subject</label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500">
                    <option>Subscription &amp; Payment Inquiry (JazzCash / Easypaisa)</option>
                    <option>Movie Upload Rights &amp; Partnership</option>
                    <option>Video Streaming / Playback Quality</option>
                    <option>General Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your question or issue in detail..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Support Request</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
