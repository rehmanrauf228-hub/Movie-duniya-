import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Crown,
  CreditCard,
  Building,
  Smartphone,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react';
import {
  SubscriptionPlan,
  SUBSCRIPTION_PLANS,
  verifyPaymentTransaction,
  PaymentTransaction
} from '../utils/movieEngine';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  onPaymentSuccess: (transaction: PaymentTransaction) => void;
  userEmail: string;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSelectPlan,
  onPaymentSuccess,
  userEmail
}) => {
  if (!isOpen) return null;

  const [gateway, setGateway] = useState<'jazzcash' | 'easypaisa' | 'card' | 'bank'>('jazzcash');
  const [phoneNumber, setPhoneNumber] = useState('03001234567');
  const [cnicDigits, setCnicDigits] = useState('42101-1234567-1');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [bankName, setBankName] = useState('Meezan Bank Limited');
  const [bankAccount, setBankAccount] = useState('PK36MEZN00012345678901');

  const [step, setStep] = useState<'DETAILS' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('DETAILS');
  const [transactionResult, setTransactionResult] = useState<PaymentTransaction | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleProcessPayment = () => {
    setStep('PROCESSING');
    setErrorMessage('');

    // Verification handshake simulation (2 seconds server verification API)
    setTimeout(() => {
      let accountRef = '';
      if (gateway === 'jazzcash' || gateway === 'easypaisa') {
        accountRef = phoneNumber;
      } else if (gateway === 'card') {
        accountRef = `Card ending in ${cardNumber.slice(-4)}`;
      } else {
        accountRef = `${bankName} (${bankAccount.slice(-6)})`;
      }

      const res = verifyPaymentTransaction(gateway, selectedPlan.id, accountRef);

      if (res.success) {
        const paidAt = new Date().toISOString();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.durationMonths);

        const tx: PaymentTransaction = {
          id: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          userId: userEmail || 'user-guest',
          userEmail: userEmail || 'guest@movieduniya.com',
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: selectedPlan.currency,
          gateway,
          accountReference: accountRef,
          transactionRef: res.transactionRef,
          status: 'SUCCESS',
          paidAt,
          expiresAt: expiryDate.toISOString()
        };

        setTransactionResult(tx);
        setStep('SUCCESS');
        onPaymentSuccess(tx);
      } else {
        setErrorMessage(res.error || 'Payment verification failed with provider.');
        setStep('FAILED');
      }
    }, 1800);
  };

  const handleDownloadInvoice = () => {
    if (!transactionResult) return;
    const content = `
=============================================
             MOVIEDUNIYA STREAMING
            OFFICIAL PAYMENT RECEIPT
=============================================
Receipt ID: ${transactionResult.id}
Transaction Reference: ${transactionResult.transactionRef}
Date: ${new Date(transactionResult.paidAt).toLocaleString()}
Customer Email: ${transactionResult.userEmail}

PLAN DETAILS:
---------------------------------------------
Subscription Plan: ${transactionResult.planName}
Billing Cycle: ${selectedPlan.periodText}
Status: CONFIRMED & ACTIVE
Access: Unlimited Movies & Series, 4K HD

PAYMENT METHOD:
---------------------------------------------
Gateway: ${transactionResult.gateway.toUpperCase()}
Account: ${transactionResult.accountReference}
Amount Paid: ${transactionResult.currency} ${transactionResult.amount}
Tax / Service Fee: Rs. 0 (Inclusive)
TOTAL CHARGED: ${transactionResult.currency} ${transactionResult.amount}

Subscription Valid Until: ${new Date(transactionResult.expiresAt).toLocaleDateString()}
Support: support@movieduniya.com
=============================================
Thank you for choosing MovieDuniya!
Watch • Upload • Enjoy
=============================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MovieDuniya-Receipt-${transactionResult.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0f1018] border border-white/10 shadow-[0_0_50px_rgba(229,9,20,0.25)] p-6 sm:p-8 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'DETAILS' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Upgrade to MovieDuniya VIP
                </h3>
                <p className="text-xs text-zinc-400">
                  Instant activation with JazzCash, Easypaisa, Card, or Bank
                </p>
              </div>
            </div>

            {/* Plan Selector Pills */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                1. Select Subscription Plan
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isChosen = selectedPlan.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => onSelectPlan(plan)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isChosen
                          ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-red-500'
                          : 'border-white/10 bg-[#161722] hover:border-white/20'
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                          POPULAR
                        </span>
                      )}
                      {plan.isBestValue && (
                        <span className="absolute -top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-sm">
                          VALUE
                        </span>
                      )}
                      <div className="text-xs font-bold text-white truncate">{plan.name}</div>
                      <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
                        Rs. {plan.price}
                      </div>
                      <div className="text-[10px] text-zinc-400">{plan.periodText}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                2. Choose Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* JazzCash */}
                <button
                  type="button"
                  onClick={() => setGateway('jazzcash')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gateway === 'jazzcash'
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                      : 'border-white/10 bg-[#161722] hover:border-white/20'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#f39c12]" />
                  <span className="text-xs font-bold text-white">JazzCash</span>
                  <span className="text-[9px] text-zinc-400">Mobile Account</span>
                </button>

                {/* Easypaisa */}
                <button
                  type="button"
                  onClick={() => setGateway('easypaisa')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gateway === 'easypaisa'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                      : 'border-white/10 bg-[#161722] hover:border-white/20'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Easypaisa</span>
                  <span className="text-[9px] text-zinc-400">Wallet / OTP</span>
                </button>

                {/* Card */}
                <button
                  type="button"
                  onClick={() => setGateway('card')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gateway === 'card'
                      ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                      : 'border-white/10 bg-[#161722] hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-white">Debit / Card</span>
                  <span className="text-[9px] text-zinc-400">Visa / Mastercard</span>
                </button>

                {/* Bank Transfer */}
                <button
                  type="button"
                  onClick={() => setGateway('bank')}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    gateway === 'bank'
                      ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                      : 'border-white/10 bg-[#161722] hover:border-white/20'
                  }`}
                >
                  <Building className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-bold text-white">Bank Transfer</span>
                  <span className="text-[9px] text-zinc-400">Direct IBAN</span>
                </button>
              </div>
            </div>

            {/* Dynamic Gateway Inputs */}
            <div className="p-4 rounded-2xl bg-[#161722] border border-white/5 space-y-3">
              {(gateway === 'jazzcash' || gateway === 'easypaisa') && (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    {gateway === 'jazzcash' ? 'JazzCash Mobile Account Number' : 'Easypaisa Account Number'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 03001234567"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                      PK (+92)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    You will receive an automated MPIN authorization prompt on your phone.
                  </p>
                </div>
              )}

              {gateway === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 2222 3333 4444"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">
                        Security Code (CVV)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {gateway === 'bank' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Beneficiary Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="Meezan Bank Limited">Meezan Bank Limited</option>
                      <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                      <option value="Bank Alfalah">Bank Alfalah</option>
                      <option value="Standard Chartered Pakistan">Standard Chartered Pakistan</option>
                      <option value="Allied Bank Limited">Allied Bank Limited</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Account / IBAN Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total and Submit */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-zinc-400 block">Total Due:</span>
                <div className="text-2xl font-black text-white">
                  Rs. {selectedPlan.price.toLocaleString()}{' '}
                  <span className="text-xs text-zinc-400 font-normal">{selectedPlan.periodText}</span>
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm &amp; Pay Rs. {selectedPlan.price}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING STATE */}
        {step === 'PROCESSING' && (
          <div className="py-16 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-ping" />
              <div className="w-20 h-20 rounded-full border-4 border-red-600 border-t-transparent animate-spin flex items-center justify-center" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                Connecting to {gateway.toUpperCase()} Gateway...
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-2">
                Verifying transaction credentials and securing your MovieDuniya VIP subscription. Please do not close this window.
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === 'SUCCESS' && transactionResult && (
          <div className="py-6 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Payment Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Welcome to MovieDuniya VIP!
              </h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto mt-1">
                Your subscription to the <span className="font-bold text-white">{transactionResult.planName}</span> is now active. All VIP 4K &amp; HD movies are unlocked.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#161722] border border-white/10 text-left text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-zinc-200 font-bold">{transactionResult.transactionRef}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Amount Paid:</span>
                <span className="text-white font-bold">Rs. {transactionResult.amount}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Gateway:</span>
                <span className="text-white uppercase font-bold">{transactionResult.gateway}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Active Until:</span>
                <span className="text-amber-400 font-bold">
                  {new Date(transactionResult.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadInvoice}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 cursor-pointer transition-colors"
              >
                Start Watching Now
              </button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {step === 'FAILED' && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">Payment Unsuccessful</h3>
              <p className="text-sm text-zinc-400 mt-2">{errorMessage}</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setStep('DETAILS')}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-white/10 text-zinc-300 text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
