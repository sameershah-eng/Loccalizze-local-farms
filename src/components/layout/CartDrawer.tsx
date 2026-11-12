import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet } from '../ui/Sheet';
import { useCart } from '../../context/CartContext';
import { Stepper } from '../ui/Stepper';
import { Button } from '../ui/Button';
import { ShoppingBag, Trash2, ArrowRight, Store } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
  } = useCart();

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // Group items by farm
  const itemsByFarm = items.reduce((acc, item) => {
    const farmName = item.product.farmName || 'Local Farm';
    if (!acc[farmName]) acc[farmName] = [];
    acc[farmName].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleStartShopping = () => {
    setIsCartOpen(false);
    navigate('/farms');
  };

  const handleOpenCheckout = () => {
    setIsCheckoutModalOpen(true);
  };

  return (
    <>
      <Sheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Harvest Cart"
      >
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-16 h-16 rounded-3xl bg-[#F3EEE3] flex items-center justify-center text-[#1F4D3A] mb-4">
              <ShoppingBag className="w-8 h-8 text-[#1F4D3A]/60" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-[#1F4D3A] mb-2">
              Your cart is empty
            </h4>
            <p className="text-sm text-[#6B645A] max-w-xs mb-6">
              Discover fresh heirloom vegetables, raw honey, and artisan sourdough from family farms near you.
            </p>
            <Button variant="solid" onClick={handleStartShopping}>
              Explore Farms
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between">
            {/* Scrollable Items grouped by Farm */}
            <div className="space-y-6 flex-1 pr-1">
              {Object.entries(itemsByFarm).map(([farmName, farmItems]) => (
                <div key={farmName} className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4D3A] uppercase tracking-wider pb-1 border-b border-[#E7E0D2]">
                    <Store className="w-3.5 h-3.5" />
                    <span>{farmName}</span>
                  </div>

                  <div className="space-y-3">
                    {farmItems.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#E7E0D2] shadow-xs"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-[#1E1B16] truncate">
                            {product.name}
                          </h5>
                          <p className="text-xs text-[#6B645A]">
                            ${product.price.toFixed(2)} / {product.unit}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Stepper
                              size="sm"
                              value={quantity}
                              onChange={(q) => updateQuantity(product.id, q)}
                            />
                            <button
                              onClick={() => removeFromCart(product.id)}
                              aria-label={`Remove ${product.name}`}
                              className="text-[#6B645A] hover:text-[#C2414B] p-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Checkout Sticky Footer */}
            <div className="pt-4 border-t border-[#E7E0D2] space-y-3 bg-[#FBF8F1]">
              <div className="bg-white rounded-2xl p-4 border border-[#E7E0D2] space-y-2">
                <div className="flex justify-between items-center text-xs text-[#6B645A]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1E1B16] tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[#6B645A]">
                  <span>Pickup at Farmstand</span>
                  <span className="font-semibold text-[#6BBF59]">Free</span>
                </div>
                <div className="pt-2 border-t border-[#E7E0D2] flex justify-between items-center">
                  <span className="font-bold text-sm text-[#1E1B16]">Estimated Total</span>
                  <span className="font-serif text-2xl font-bold text-[#1F4D3A] tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleOpenCheckout}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Checkout (${subtotal.toFixed(2)})
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Checkout details modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </>
  );
};
