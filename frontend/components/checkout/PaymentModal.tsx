"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  ShieldCheck, 
  Lock, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
  onFailure: (errorMessage: string) => void;
  totalAmount: number;
  seatCount: number;
  movieTitle: string;
  showTime: string;
  seatLabels: string;
  idempotencyKey: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
  totalAmount,
  seatCount,
  movieTitle,
  showTime,
  seatLabels,
  idempotencyKey,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "wallet">("card");
  const [simulateSuccess, setSimulateSuccess] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);

    // Simulate 1.2s realistic payment gateway processing latency
    setTimeout(() => {
      setIsProcessing(false);

      if (simulateSuccess) {
        const txnId = `txn_${Math.random().toString(36).substring(2, 11)}`;
        onSuccess(txnId);
      } else {
        onFailure("Card declined: Insufficient funds or simulated gateway failure.");
      }
    }, 1200);
  };

  const convenienceFee = (totalAmount * 0.08);
  const grandTotal = totalAmount + convenienceFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#12182B] border border-white/10 shadow-2xl overflow-hidden animate-[slideUp_0.25s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-[#161E36] to-indigo-950 p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Secure Checkout</h3>
              <p className="text-[11px] text-slate-400">256-Bit Encrypted Transaction</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Order Summary Box */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4.5 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-white">{movieTitle}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{showTime}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400/10 text-amber-300 text-[11px] font-bold">
                  Seats ({seatCount}): {seatLabels}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Base Fare</p>
                <p className="text-sm font-bold text-white">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs text-slate-400">
              <span>Convenience Fee & Taxes (8%)</span>
              <span>${convenienceFee.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center font-bold text-base text-white">
              <span>Total Payable</span>
              <span className="text-emerald-400 text-lg">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Payment Option
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "card"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span className="text-[11px] font-bold">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "upi"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold">UPI / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("wallet")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  paymentMethod === "wallet"
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                    : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">Starpass Pay</span>
              </button>
            </div>
          </div>

          {/* Form Fields for Card */}
          {paymentMethod === "card" && (
            <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expires (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="888"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Simulated Mode Switch for Verification (Story #9) */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Payment Simulation Mode</p>
                <p className="text-[10px] text-slate-400">Toggle outcome to test seat unlock on failure</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSimulateSuccess(!simulateSuccess)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                simulateSuccess
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {simulateSuccess ? "Simulate Success" : "Simulate Fail"}
            </button>
          </div>

          {/* Idempotency Footer Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <span className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Key: {idempotencyKey.substring(0, 8)}...
            </span>
            <span>Zero Double-Charge Guarantee</span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ${grandTotal.toFixed(2)} & Confirm Seats</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
