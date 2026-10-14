import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, HelpCircle, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId = '',
}) => {
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.refunds.request({
        orderId: orderId.trim(),
        reason: reason.trim(),
        amount: amount ? Number(amount) : undefined,
      });
      setSuccessMsg('Your refund / issue ticket has been filed successfully. Our UP operations finance team will review and credit via UPI reversal.');
      setReason('');
      setAmount('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-white" />
            <h3 className="font-extrabold text-lg">Customer Care & Support</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
            <p className="font-bold">24x7 Uttar Pradesh Food Delivery Helpline:</p>
            <p className="mt-0.5">Toll Free: 1800-FOOD-DILVRY • Email: support@fooddilvry.in</p>
          </div>

          <form onSubmit={handleSubmitRefund} className="space-y-3.5">
            <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-red-600" />
              <span>Report an Issue or Request Refund</span>
            </h4>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Order Number / ID</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. FD-UP-94101"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Issue / Refund Reason</label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain what happened (e.g. Food arrived spilled, incorrect dish delivered, excessive delay)..."
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Claim Amount in ₹ (Optional)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Leave blank for full order amount"
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting Ticket...' : 'Submit Support Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
