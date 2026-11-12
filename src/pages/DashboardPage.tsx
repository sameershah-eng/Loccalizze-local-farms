import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Store,
  Calendar,
  ChevronRight,
  Filter,
  DollarSign,
  Star,
  Users,
  Search,
} from 'lucide-react';
import {
  useOrders,
  useProducts,
  useFarm,
  useUpdateOrderStatus,
  useSaveProduct,
  useDeleteProduct,
} from '../hooks/useData';
import { Order, Product, OrderStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Sheet } from '../components/ui/Sheet';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'profile'>('overview');
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');
  const { showToast } = useToast();

  // Load Sarah's farm data for demo
  const { data: farm } = useFarm('willow-creek-farm');
  const { data: products = [], isLoading: isLoadingProducts } = useProducts(farm?.id || 'farm-1');
  const { data: orders = [], isLoading: isLoadingOrders } = useOrders(farm?.id || 'farm-1');

  const updateOrderStatusMutation = useUpdateOrderStatus();
  const saveProductMutation = useSaveProduct();
  const deleteProductMutation = useDeleteProduct();

  // State for Product modal/drawer
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Stats calculation
  const totalWeeklySales = orders.reduce((sum, o) => sum + o.subtotal, 0) + 1420;
  const totalOrdersCount = orders.length + 58;

  // Handler to update order status
  const handleAdvanceStatus = async (order: Order) => {
    let nextStatus: OrderStatus = 'Preparing';
    if (order.status === 'New') nextStatus = 'Preparing';
    else if (order.status === 'Preparing') nextStatus = 'Ready';
    else if (order.status === 'Ready') nextStatus = 'Completed';

    await updateOrderStatusMutation.mutateAsync({ orderId: order.id, status: nextStatus });
    showToast({
      title: 'Order Status Updated',
      message: `Order #${order.id} is now ${nextStatus}. Customer has been notified.`,
      type: 'success',
    });
  };

  // Toggle active/hidden product status
  const handleToggleProductStatus = async (product: Product) => {
    await saveProductMutation.mutateAsync({
      ...product,
      inStock: !product.inStock,
    });
    showToast({
      title: !product.inStock ? 'Listing Activated' : 'Listing Hidden',
      message: `${product.name} is now ${!product.inStock ? 'visible to shoppers' : 'hidden from farmstand'}.`,
      type: 'info',
    });
  };

  // Save product from form
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) return;

    await saveProductMutation.mutateAsync({
      ...editingProduct,
      farmId: farm?.id || 'farm-1',
      farmName: farm?.name || 'Willow Creek Farm',
    });

    setIsProductDrawerOpen(false);
    setEditingProduct(null);
    showToast({
      title: 'Product Saved',
      message: `${editingProduct.name} updated successfully.`,
      type: 'success',
    });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    await deleteProductMutation.mutateAsync(productToDelete.id);
    setProductToDelete(null);
    showToast({
      title: 'Product Removed',
      message: `${productToDelete.name} was deleted from your listings.`,
      type: 'info',
    });
  };

  const filteredOrders = orders.filter(
    (o) => orderFilter === 'All' || o.status === orderFilter
  );

  return (
    <div className="min-h-screen bg-[#FBF8F1] pt-20 pb-24 lg:pb-12 flex">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r border-[#E7E0D2] p-6 shrink-0 min-h-[calc(100vh-80px)]">
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-2 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2]">
            <img
              src={farm?.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'}
              alt="Sarah Jenkins"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1F4D3A] truncate">
                {farm?.name || 'Willow Creek Farm'}
              </p>
              <p className="text-[11px] text-[#6B645A] truncate">Sarah Jenkins · Owner</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-bold">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Harvest Listings', icon: Package, badge: products.length },
              { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: orders.length },
              { id: 'profile', label: 'Farm Settings', icon: User },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1F4D3A] text-white shadow-xs'
                      : 'text-[#6B645A] hover:bg-[#F3EEE3] hover:text-[#1E1B16]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#F3EEE3] text-[#1F4D3A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2] space-y-2">
          <p className="text-xs font-bold text-[#1F4D3A]">Public Farmstand</p>
          <p className="text-[11px] text-[#6B645A]">Preview how shoppers view your harvest.</p>
          <Link to={`/farms/${farm?.slug || 'willow-creek-farm'}`}>
            <Button variant="outline" size="sm" className="w-full mt-1">
              View Public Page
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Header Greeting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#6BBF59] uppercase tracking-wider">
                  Grower Dashboard
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F4D3A]">
                  Good morning, Sarah
                </h1>
                <p className="text-xs sm:text-sm text-[#6B645A] mt-1">
                  Here is what is happening at Willow Creek Farm this week.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      category: 'Vegetables',
                      price: 5.0,
                      unit: 'lb',
                      stockCount: 20,
                      inStock: true,
                    });
                    setIsProductDrawerOpen(true);
                  }}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Produce Listing
                </Button>
              </div>
            </div>

            {/* Stat Cards with Mini Sparklines & Animated Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Weekly Sales',
                  value: `$${totalWeeklySales.toLocaleString()}`,
                  change: '+14% vs last week',
                  icon: DollarSign,
                },
                {
                  label: 'Active Orders',
                  value: totalOrdersCount.toString(),
                  change: '5 to pack this morning',
                  icon: ShoppingBag,
                },
                {
                  label: 'Profile Views',
                  value: '1,206',
                  change: '+28% from local search',
                  icon: Users,
                },
                {
                  label: 'Shopper Rating',
                  value: '4.9 ★',
                  change: '148 community reviews',
                  icon: Star,
                },
              ].map((stat, i) => (
                <Card key={i} className="p-4 sm:p-5 bg-white border border-[#E7E0D2] shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#6B645A] uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <div className="p-1.5 rounded-xl bg-[#F3EEE3] text-[#1F4D3A]">
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F4D3A]">
                    {stat.value}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#6BBF59] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{stat.change}</span>
                  </p>
                </Card>
              ))}
            </div>

            {/* Profile Completion Card */}
            <div className="p-5 bg-gradient-to-r from-[#1F4D3A] to-[#143326] text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-[#A8D672] uppercase tracking-wider">
                  Profile Optimization · 90% Complete
                </span>
                <h4 className="font-serif text-xl font-bold">
                  Add your Saturday delivery cutoff time
                </h4>
                <p className="text-xs text-white/80 max-w-lg">
                  Farms that list specific pickup cutoff hours see 35% higher order completion before weekend mornings.
                </p>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                Complete Setting
              </Button>
            </div>

            {/* Recent Orders Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1F4D3A]">
                    Recent Harvest Orders
                  </h3>
                  <p className="text-xs text-[#6B645A]">Incoming pickups and deliveries</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#1F4D3A] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {isLoadingOrders ? (
                <Skeleton className="h-48 w-full rounded-2xl" />
              ) : (
                <div className="bg-white rounded-3xl border border-[#E7E0D2] overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F3EEE3]/80 border-b border-[#E7E0D2] text-[#6B645A] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Order ID</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Fulfillment</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0D2]">
                        {orders.slice(0, 4).map((order) => (
                          <tr key={order.id} className="hover:bg-[#FBF8F1] transition-colors">
                            <td className="p-4 font-bold text-[#1F4D3A]">#{order.id}</td>
                            <td className="p-4">
                              <p className="font-bold text-[#1E1B16]">{order.customerName}</p>
                              <p className="text-[11px] text-[#6B645A]">{order.customerPhone}</p>
                            </td>
                            <td className="p-4">
                              <span className="capitalize font-semibold text-[#1E1B16]">{order.fulfillmentType}</span>
                              <p className="text-[11px] text-[#6B645A]">{order.fulfillmentDate}</p>
                            </td>
                            <td className="p-4 font-bold text-[#1E1B16] tabular-nums">
                              ${order.subtotal.toFixed(2)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  order.status === 'New'
                                    ? 'bg-[#F2A541]/15 text-[#A65B00]'
                                    : order.status === 'Preparing'
                                    ? 'bg-[#1F4D3A]/10 text-[#1F4D3A]'
                                    : order.status === 'Ready'
                                    ? 'bg-[#6BBF59]/20 text-[#1F4D3A]'
                                    : 'bg-[#F3EEE3] text-[#6B645A]'
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {order.status !== 'Completed' ? (
                                <button
                                  onClick={() => handleAdvanceStatus(order)}
                                  className="text-xs font-bold text-[#1F4D3A] hover:underline"
                                >
                                  {order.status === 'New'
                                    ? 'Start Pack'
                                    : order.status === 'Preparing'
                                    ? 'Mark Ready'
                                    : 'Complete'}
                                </button>
                              ) : (
                                <span className="text-[#6BBF59] font-bold">Done</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRODUCTS MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1F4D3A]">
                  Harvest Listings ({products.length})
                </h2>
                <p className="text-xs text-[#6B645A]">
                  Manage prices, available stock, and public visibility.
                </p>
              </div>

              <Button
                variant="gradient"
                size="md"
                onClick={() => {
                  setEditingProduct({
                    name: '',
                    category: 'Vegetables',
                    price: 5.0,
                    unit: 'lb',
                    stockCount: 20,
                    inStock: true,
                  });
                  setIsProductDrawerOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add New Product
              </Button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-[#E7E0D2] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F3EEE3]/80 border-b border-[#E7E0D2] text-[#6B645A] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Produce Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">In Stock</th>
                      <th className="p-4">Visibility</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D2]">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-[#FBF8F1] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <p className="font-bold text-sm text-[#1E1B16]">{product.name}</p>
                              <p className="text-[11px] text-[#6B645A]">{product.badge || 'Standard'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[#1E1B16]">{product.category}</td>
                        <td className="p-4 font-serif text-sm font-bold text-[#1F4D3A]">
                          ${product.price.toFixed(2)} / {product.unit}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-bold ${
                              product.stockCount <= 5 ? 'text-[#C2414B]' : 'text-[#1E1B16]'
                            }`}
                          >
                            {product.stockCount} {product.unit}s
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleProductStatus(product)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                              product.inStock
                                ? 'bg-[#6BBF59]/20 text-[#1F4D3A]'
                                : 'bg-[#E7E0D2] text-[#6B645A]'
                            }`}
                          >
                            {product.inStock ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{product.inStock ? 'Active' : 'Hidden'}</span>
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductDrawerOpen(true);
                            }}
                            aria-label={`Edit ${product.name}`}
                            className="p-1.5 text-[#6B645A] hover:text-[#1F4D3A] rounded-lg hover:bg-[#F3EEE3]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            aria-label={`Delete ${product.name}`}
                            className="p-1.5 text-[#6B645A] hover:text-[#C2414B] rounded-lg hover:bg-[#F3EEE3]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#1F4D3A]">
                  Customer Orders ({filteredOrders.length})
                </h2>
                <p className="text-xs text-[#6B645A]">
                  Mark orders ready as you harvest and box them up.
                </p>
              </div>

              {/* Order Status Filters */}
              <div className="flex gap-1.5 bg-white p-1 rounded-2xl border border-[#E7E0D2]">
                {(['All', 'New', 'Preparing', 'Ready', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      orderFilter === st
                        ? 'bg-[#1F4D3A] text-white shadow-xs'
                        : 'text-[#6B645A] hover:text-[#1E1B16]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <EmptyState
                title="No orders found"
                description={`There are currently no orders under "${orderFilter}".`}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="p-5 bg-white border border-[#E7E0D2] space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-lg font-bold text-[#1F4D3A]">
                            #{order.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'New'
                                ? 'bg-[#F2A541]/15 text-[#A65B00]'
                                : order.status === 'Preparing'
                                ? 'bg-[#1F4D3A]/10 text-[#1F4D3A]'
                                : order.status === 'Ready'
                                ? 'bg-[#6BBF59]/20 text-[#1F4D3A]'
                                : 'bg-[#F3EEE3] text-[#6B645A]'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B645A] mt-0.5">{order.createdAt}</p>
                      </div>

                      <span className="font-serif text-xl font-bold text-[#1F4D3A]">
                        ${order.subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-[#FBF8F1] rounded-2xl border border-[#E7E0D2] text-xs space-y-1">
                      <p className="font-bold text-[#1E1B16]">{order.customerName}</p>
                      <p className="text-[#6B645A]">{order.customerPhone} · {order.customerEmail}</p>
                      <p className="text-[#1F4D3A] font-semibold pt-1">
                        {order.fulfillmentType === 'pickup' ? 'Farmstand Pickup: ' : 'Local Delivery: '}
                        {order.fulfillmentDate}
                      </p>
                      {order.notes && (
                        <p className="text-xs text-[#A65B00] italic pt-1">
                          &quot;{order.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Items Breakdown */}
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-[#1E1B16]">Boxed Items:</p>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[#6B645A]">
                          <span>
                            {item.quantity}× {item.productName}
                          </span>
                          <span className="tabular-nums font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[#E7E0D2] flex justify-end">
                      {order.status !== 'Completed' ? (
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleAdvanceStatus(order)}
                        >
                          {order.status === 'New'
                            ? 'Start Packing Box'
                            : order.status === 'Preparing'
                            ? 'Mark Box Ready for Pickup'
                            : 'Complete Order'}
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-[#6BBF59] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Picked up & Paid
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FARM PROFILE SETTINGS TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1F4D3A]">
                Farm Settings & Story
              </h2>
              <p className="text-xs text-[#6B645A]">
                Update your farmstand open days, delivery radius, and bio.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E7E0D2] space-y-4">
              <Input
                label="Farm Name"
                defaultValue={farm?.name || 'Willow Creek Farm'}
              />
              <Input
                label="Tagline"
                defaultValue={farm?.tagline || 'Fifth-generation organic vegetables & heritage greens'}
              />
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-[#1E1B16]">Farm Bio & Soil Practices</label>
                <textarea
                  defaultValue={farm?.story}
                  rows={4}
                  className="w-full bg-white border border-[#E7E0D2] rounded-2xl p-3 text-sm text-[#1E1B16] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Pickup Days"
                  defaultValue={farm?.pickupDays.join(', ')}
                />
                <Input
                  label="Pickup Hours"
                  defaultValue={farm?.pickupHours}
                />
              </div>
              <Button
                variant="solid"
                onClick={() => {
                  showToast({
                    title: 'Settings Saved',
                    message: 'Your farm profile information was updated.',
                    type: 'success',
                  });
                }}
              >
                Save Farm Settings
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E7E0D2] z-30 flex justify-around p-2">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Produce', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'profile', label: 'Settings', icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] font-bold ${
              activeTab === tab.id ? 'text-[#1F4D3A]' : 'text-[#6B645A]'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Product Add/Edit Drawer */}
      <Sheet
        isOpen={isProductDrawerOpen}
        onClose={() => {
          setIsProductDrawerOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct?.id ? 'Edit Produce Listing' : 'Add New Produce Listing'}
      >
        <form onSubmit={handleSaveProductSubmit} className="space-y-4 pt-2">
          <Input
            label="Produce Name"
            value={editingProduct?.name || ''}
            onChange={(e) =>
              setEditingProduct((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. Heirloom Brandywine Tomatoes"
            required
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-[#1E1B16]">Category</label>
            <select
              value={editingProduct?.category || 'Vegetables'}
              onChange={(e) =>
                setEditingProduct((prev) => ({
                  ...prev,
                  category: e.target.value as any,
                }))
              }
              className="bg-white border border-[#E7E0D2] rounded-2xl px-3 py-2 text-sm text-[#1E1B16] outline-none min-h-[44px]"
            >
              {['Vegetables', 'Fruit', 'Eggs & Dairy', 'Meat', 'Honey', 'Bakery', 'Flowers'].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.25"
              value={editingProduct?.price || ''}
              onChange={(e) =>
                setEditingProduct((prev) => ({
                  ...prev,
                  price: parseFloat(e.target.value),
                }))
              }
              placeholder="5.50"
              required
            />
            <Input
              label="Unit"
              value={editingProduct?.unit || ''}
              onChange={(e) =>
                setEditingProduct((prev) => ({ ...prev, unit: e.target.value }))
              }
              placeholder="lb, pint, dozen"
              required
            />
          </div>

          <Input
            label="Available Quantity"
            type="number"
            value={editingProduct?.stockCount || ''}
            onChange={(e) =>
              setEditingProduct((prev) => ({
                ...prev,
                stockCount: parseInt(e.target.value, 10),
              }))
            }
            placeholder="25"
            required
          />

          <Input
            label="Badge / Highlight (Optional)"
            value={editingProduct?.badge || ''}
            onChange={(e) =>
              setEditingProduct((prev) => ({ ...prev, badge: e.target.value }))
            }
            placeholder="e.g. Picked this morning"
          />

          <div className="pt-4 border-t border-[#E7E0D2]">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              isLoading={saveProductMutation.isPending}
            >
              Save Listing
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Product Delete Confirmation Modal */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Remove Produce Listing"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B645A]">
            Are you sure you want to remove <strong className="text-[#1E1B16]">{productToDelete?.name}</strong>? Shoppers will no longer be able to reserve it for upcoming pickup days.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => setProductToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              className="w-1/2 bg-[#C2414B] hover:bg-[#9E252E]"
              onClick={handleConfirmDelete}
            >
              Delete Listing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
