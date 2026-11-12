import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, MapPin, Truck, Store, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    handleCheckout,
    isCheckingOut,
    checkoutSuccessOrder,
    setCheckoutSuccessOrder,
  } = useCart();

  const [customerName, setCustomerName] = useState('Claire Abernathy');
  const [customerEmail, setCustomerEmail] = useState('claire.abernathy@gmail.com');
  const [customerPhone, setCustomerPhone] = useState('(512) 844-9102');
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'Please enter your full name';
    if (!customerEmail.trim() || !customerEmail.includes('@'))
      errs.customerEmail = 'Please enter a valid email address';
    if (!customerPhone.trim()) errs.customerPhone = 'Please enter a contact phone number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ok = await handleCheckout({
      customerName,
      customerEmail,
      customerPhone,
      fulfillmentType,
      notes,
    });

    if (ok) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#1F4D3A', '#6BBF59', '#F2A541', '#A8D672'],
        });
      } catch {
        // Fallback if canvas is unavailable
      }
    }
  };

  const handleFinish = (goToDashboard: boolean = false) => {
    setCheckoutSuccessOrder(null);
    onClose();
    if (goToDashboard) {
      navigate('/dashboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isCheckingOut && onClose()}
        className="fixed inset-0 bg-[#143326]/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-[#FBF8F1] rounded-3xl border border-[#E7E0D2] shadow-2xl p-6 sm:p-8 z-10 max-h-[92vh] overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {checkoutSuccessOrder ? (
            /* Celebration Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-[#6BBF59]/20 text-[#1F4D3A] flex items-center justify-center mx-auto border border-[#6BBF59]/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
                  Reservation Confirmed
                </span>
                <h3 className="font-serif text-3xl font-bold text-[#1F4D3A] mt-1">
                  Thank you, {checkoutSuccessOrder.customerName.split(' ')[0]}!
                </h3>
                <p className="text-sm text-[#6B645A] mt-2 max-w-sm mx-auto">
                  Your fresh produce order <span className="font-bold text-[#1E1B16]">#{checkoutSuccessOrder.id}</span> has been sent directly to {checkoutSuccessOrder.farmName}.
                </p>
              </div>

              {/* Order summary box */}
              <div className="bg-white rounded-2xl p-4 border border-[#E7E0D2] text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6B645A] pb-2 border-b border-[#E7E0D2]">
                  <span>Fulfillment</span>
                  <span className="capitalize font-bold text-[#1F4D3A]">
                    {checkoutSuccessOrder.fulfillmentType}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-[#1E1B16] flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-[#1F4D3A]" />
                    {checkoutSuccessOrder.farmName}
                  </p>
                  <p className="text-xs text-[#6B645A] mt-1 pl-5.5">
                    {checkoutSuccessOrder.fulfillmentDate}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#E7E0D2] flex justify-between items-center text-sm">
                  <span className="text-[#6B645A]">Total ({checkoutSuccessOrder.items.length} items)</span>
                  <span className="font-serif text-lg font-bold text-[#1F4D3A]">
                    ${checkoutSuccessOrder.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={() => handleFinish(true)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  View on Farm Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => handleFinish(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Checkout Form */
            <motion.div key="form">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#1F4D3A]">
                    Reserve Your Harvest
                  </h3>
                  <p className="text-xs text-[#6B645A] mt-0.5">
                    Pay upon pickup or delivery directly to the grower
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close checkout"
                  className="p-2 text-[#6B645A] hover:text-[#1E1B16] rounded-full hover:bg-[#F3EEE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Fulfillment options */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-[#F3EEE3] rounded-2xl border border-[#E7E0D2]">
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('pickup')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      fulfillmentType === 'pickup'
                        ? 'bg-white text-[#1F4D3A] shadow-sm'
                        : 'text-[#6B645A] hover:text-[#1E1B16]'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Farmstand Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfillmentType('delivery')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      fulfillmentType === 'delivery'
                        ? 'bg-white text-[#1F4D3A] shadow-sm'
                        : 'text-[#6B645A] hover:text-[#1E1B16]'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Local Delivery</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={errors.customerName}
                    placeholder="Jane Doe"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    error={errors.customerEmail}
                    placeholder="jane@example.com"
                    hint="We'll send your harvest confirmation here"
                    required
                  />
                  <Input
                    label="Mobile Phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    error={errors.customerPhone}
                    placeholder="(512) 000-0000"
                    hint="For pickup reminders and delivery coordination"
                    required
                  />

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-bold text-[#1E1B16]">
                      Special Instructions / Gate Code (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please leave on the front porch cooler"
                      rows={2}
                      className="w-full bg-white border border-[#E7E0D2] rounded-2xl p-3 text-sm text-[#1E1B16] focus:border-[#1F4D3A] focus:ring-2 focus:ring-[#1F4D3A]/20 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Subtotal review */}
                <div className="p-4 bg-white rounded-2xl border border-[#E7E0D2] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#6B645A]">Order Total ({items.length} items)</p>
                    <p className="text-xs font-medium text-[#6BBF59]">Zero platform fees for local farms</p>
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#1F4D3A]">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={isCheckingOut}
                >
                  Confirm Harvest Reservation
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
