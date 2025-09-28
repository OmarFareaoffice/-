import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- MOCK DATA ---
// Fix: Explicitly type mockOrders as Order[] to ensure correct type inference for the 'status' property.
const mockOrders: Order[] = [
  { id: 1, customerName: 'أحمد محمود', address: '123 شارع النصر، القاهرة', value: 150, fee: 25, notes: 'يرجى الاتصال قبل الوصول', status: 'pending', storeId: 1, courierId: null },
  { id: 2, customerName: 'فاطمة الزهراء', address: '45 شارع الجمهورية، الجيزة', value: 220, fee: 30, notes: '', status: 'in-delivery', storeId: 1, courierId: 101 },
  { id: 3, customerName: 'خالد وليد', address: '78 شارع الحرية، الإسكندرية', value: 95, fee: 20, notes: 'الدور الثالث', status: 'delivered', storeId: 2, courierId: 102 },
  { id: 4, customerName: 'سارة عبد الرحمن', address: '90 شارع بغداد، مصر الجديدة', value: 310, fee: 35, notes: '', status: 'pending', storeId: 2, courierId: null },
  { id: 5, customerName: 'محمد علي', address: '55 شارع فيصل، الهرم', value: 180, fee: 25, notes: 'بجوار صيدلية العزبي', status: 'delivered', storeId: 1, courierId: 101 },
];

const mockUsers = {
  stores: [
    { id: 1, name: 'متجر الورود', location: 'القاهرة' },
    { id: 2, name: 'متجر الأجهزة الحديثة', location: 'الجيزة' },
  ],
  couriers: [
    { id: 101, name: 'علي حسن', phone: '01012345678', active: true },
    { id: 102, name: 'محمود السيد', phone: '01298765432', active: false },
  ],
};

// --- TYPES ---
type OrderStatus = 'pending' | 'in-delivery' | 'delivered' | 'canceled';
type Role = 'store' | 'courier' | 'supervisor' | null;

interface Order {
  id: number;
  customerName: string;
  address: string;
  value: number;
  fee: number;
  notes: string;
  status: OrderStatus;
  storeId: number;
  courierId: number | null;
}

// --- UTILITY COMPONENTS ---
const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusMap = {
    pending: { text: 'بانتظار مندوب', className: 'status-pending' },
    'in-delivery': { text: 'قيد التوصيل', className: 'status-in-delivery' },
    delivered: { text: 'تم التوصيل', className: 'status-delivered' },
    canceled: { text: 'ملغي', className: 'status-canceled' },
  };
  const { text, className } = statusMap[status];
  return <span className={`status-badge ${className}`}>{text}</span>;
};

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const Toast = ({ message, show, onClose }: { message: string, show: boolean, onClose: () => void }) => {
    useEffect(() => {
      if (show) {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
      }
    }, [show, onClose]);
  
    if (!show) return null;
  
    return <div className="toast">{message}</div>;
};

// --- DASHBOARD COMPONENTS ---

// Store Dashboard
const StoreDashboard = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders.filter(o => o.storeId === 1));
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  const handleCreateOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newOrder: Order = {
      id: Date.now(),
      customerName: formData.get('customerName') as string,
      address: formData.get('address') as string,
      value: Number(formData.get('value')),
      fee: Number(formData.get('fee')),
      notes: formData.get('notes') as string,
      status: 'pending',
      storeId: 1, // Logged in store
      courierId: null,
    };
    setOrders([newOrder, ...orders]);
    setShowModal(false);
  };

  const currentOrders = orders.filter(o => o.status === 'pending' || o.status === 'in-delivery');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'canceled');

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>الطلبات الحالية</button>
        <button className={`tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>الطلبات السابقة</button>
      </div>

      <div className="grid">
        {(activeTab === 'current' ? currentOrders : pastOrders).map(order => (
          <div key={order.id} className="card">
            <div className="order-card-header">
              <h3>طلب: {order.customerName}</h3>
              <StatusBadge status={order.status} />
            </div>
            <div className="order-card-body">
              <p><strong>قيمة الطلب:</strong> {order.value} ريال سعودي</p>
              <p><strong>رسوم التوصيل:</strong> {order.fee} ريال سعودي</p>
              <p><strong>العنوان:</strong> {order.address}</p>
              {order.notes && <p><strong>ملاحظات:</strong> {order.notes}</p>}
            </div>
          </div>
        ))}
      </div>
      
      <button className="fab" onClick={() => setShowModal(true)} aria-label="إضافة طلب جديد">+</button>

      <Modal show={showModal} onClose={() => setShowModal(false)} title="إنشاء طلب جديد">
        <form onSubmit={handleCreateOrder}>
          <div className="form-group">
            <label htmlFor="customerName">اسم العميل</label>
            <input type="text" id="customerName" name="customerName" required />
          </div>
          <div className="form-group">
            <label htmlFor="address">عنوان العميل</label>
            <input type="text" id="address" name="address" required />
          </div>
          <div className="form-group">
            <label htmlFor="value">قيمة الطلب</label>
            <input type="number" id="value" name="value" required />
          </div>
          <div className="form-group">
            <label htmlFor="fee">قيمة خدمة التوصيل</label>
            <input type="number" id="fee" name="fee" required />
          </div>
          <div className="form-group">
            <label htmlFor="notes">ملاحظات</label>
            <textarea id="notes" name="notes" rows={3}></textarea>
          </div>
          <div className="modal-footer">
             <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
             <button type="submit" className="btn btn-primary">إنشاء الطلب</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Courier Dashboard
const CourierDashboard = () => {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [activeTab, setActiveTab] = useState('new');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const courierId = 101; // Logged in courier
    
    const newOrders = orders.filter(o => o.status === 'pending');
    const prevNewOrdersCount = useRef(newOrders.length);

    // Simulate new order arrival for demonstration
    useEffect(() => {
        const timer = setTimeout(() => {
            const newSimulatedOrder: Order = {
                id: Date.now(),
                customerName: 'عميل جديد',
                address: 'عنوان افتراضي',
                value: 120,
                fee: 20,
                notes: 'طلب تمت إضافته للتو',
                status: 'pending',
                storeId: 2,
                courierId: null,
            };
            setOrders(prevOrders => [newSimulatedOrder, ...prevOrders]);
        }, 5000); // Add a new order after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    // Effect to trigger notification when new orders are added
    useEffect(() => {
        if (newOrders.length > prevNewOrdersCount.current) {
            setToastMessage('🔔 طلب جديد في انتظارك!');
            setShowToast(true);
        }
        prevNewOrdersCount.current = newOrders.length;
    }, [newOrders.length]);
  
    const handleAccept = (orderId: number) => {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'in-delivery', courierId } : o));
    };
  
    const handleComplete = (orderId: number) => {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
    };
  
    const myOrders = orders.filter(o => o.courierId === courierId && o.status === 'in-delivery');
    const totalEarnings = orders
      .filter(o => o.courierId === courierId && o.status === 'delivered')
      .reduce((sum, order) => sum + order.fee, 0);
  
    return (
      <div>
        <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
        <div className="earnings-card card">
            <h2>إجمالي أرباحي</h2>
            <p>{totalEarnings} ريال سعودي</p>
        </div>
        <div className="tabs">
          <button className={`tab ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            طلبات جديدة
            {newOrders.length > 0 && <span className="notification-badge">{newOrders.length}</span>}
          </button>
          <button className={`tab ${activeTab === 'current' ? 'active' : ''}`} onClick={() => setActiveTab('current')}>طلباتي الحالية</button>
        </div>
  
        <div className="grid">
          {activeTab === 'new' && newOrders.map(order => (
            <div key={order.id} className="card">
              <div className="order-card-header"><h3>{mockUsers.stores.find(s=>s.id === order.storeId)?.name}</h3><StatusBadge status={order.status} /></div>
              <div className="order-card-body">
                <p><strong>قيمة الطلب:</strong> {order.value} ريال سعودي</p>
                <p><strong>رسوم التوصيل:</strong> {order.fee} ريال سعودي</p>
                <p><strong>العنوان:</strong> {order.address}</p>
              </div>
              <div className="order-card-footer">
                <button className="btn btn-reject" onClick={() => alert('تم رفض الطلب')}>رفض</button>
                <button className="btn btn-accept" onClick={() => handleAccept(order.id)}>قبول</button>
              </div>
            </div>
          ))}
          {activeTab === 'current' && myOrders.map(order => (
            <div key={order.id} className="card">
              <div className="order-card-header"><h3>{order.customerName}</h3><StatusBadge status={order.status} /></div>
              <div className="order-card-body">
                 <p><strong>هاتف العميل:</strong> 01xxxxxxxxx</p>
                 <p><strong>العنوان:</strong> {order.address} <a href="#" style={{marginRight: '10px'}}> (عرض على الخريطة)</a></p>
                 <p><strong>المبلغ المطلوب تحصيله:</strong> {order.value} ريال سعودي</p>
              </div>
              <div className="order-card-footer">
                <button className="btn btn-complete" onClick={() => handleComplete(order.id)}>تم التوصيل</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
};
  

// Supervisor Dashboard
const SupervisorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div>
            <div className="tabs">
                <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>لوحة التحكم</button>
                <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>إدارة المستخدمين</button>
                <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>التقارير</button>
            </div>

            {activeTab === 'dashboard' && (
                <div className="stats-grid">
                    <div className="stat-card"><div className="value">{mockOrders.length}</div><div className="label">إجمالي الطلبات</div></div>
                    <div className="stat-card"><div className="value">{mockOrders.filter(o => o.status === 'in-delivery').length}</div><div className="label">طلبات قيد التوصيل</div></div>
                    <div className="stat-card"><div className="value">{mockUsers.couriers.filter(c => c.active).length}</div><div className="label">المناديب النشطين</div></div>
                    <div className="stat-card"><div className="value">{mockUsers.stores.length}</div><div className="label">المتاجر النشطة</div></div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <h3>المتاجر</h3>
                    <div className="table-container">
                        <table className="user-table">
                            <thead><tr><th>الاسم</th><th>الموقع</th><th>إجراءات</th></tr></thead>
                            <tbody>
                                {mockUsers.stores.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.location}</td><td className="actions"><button className="btn btn-secondary">تعديل</button><button className="btn btn-reject">حذف</button></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                    <h3 style={{marginTop: '30px'}}>المناديب</h3>
                    <div className="table-container">
                        <table className="user-table">
                            <thead><tr><th>الاسم</th><th>الهاتف</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                            <tbody>
                                {mockUsers.couriers.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.active ? 'نشط' : 'غير نشط'}</td><td className="actions"><button className="btn btn-secondary">تعديل</button><button className="btn btn-reject">حذف</button></td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'reports' && (
                <div className="card">
                    <h2>التقارير</h2>
                    <p>هنا سيتم عرض التقارير التفصيلية للطلبات والمستخدمين.</p>
                </div>
            )}
        </div>
    );
};

// --- MAIN APP ---
const App = () => {
  const [userRole, setUserRole] = useState<Role>(null);

  const handleLogin = (role: Role) => {
    setUserRole(role);
  };
  
  const handleLogout = () => {
    setUserRole(null);
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'store':
        return <StoreDashboard />;
      case 'courier':
        return <CourierDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      default:
        return null;
    }
  };
  
  const getDashboardTitle = () => {
    switch (userRole) {
        case 'store': return 'لوحة تحكم المتجر';
        case 'courier': return 'لوحة تحكم المندوب';
        case 'supervisor': return 'لوحة تحكم المشرف';
        default: return '';
    }
  }

  if (!userRole) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>🍎</h1>
          <h1>مساء التفاحتين</h1>
          <p>منصة إدارة التوصيل</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const role = (e.currentTarget.elements.namedItem('role') as HTMLSelectElement).value;
            handleLogin(role as Role);
          }}>
            <div className="form-group">
              <label htmlFor="username">اسم المستخدم</label>
              <input type="text" id="username" defaultValue="testuser" />
            </div>
            <div className="form-group">
              <label htmlFor="password">كلمة المرور</label>
              <input type="password" id="password" defaultValue="password" />
            </div>
            <div className="form-group">
              <label htmlFor="role">الدور</label>
              <select id="role" name="role" defaultValue="store">
                <option value="store">متجر</option>
                <option value="courier">مندوب</option>
                <option value="supervisor">مشرف</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">تسجيل الدخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <div className='logo'>مساء التفاحتين</div>
        <div className="navbar-right">
            <span>{getDashboardTitle()}</span>
            <button onClick={handleLogout} className='btn-logout'>تسجيل الخروج</button>
        </div>
      </nav>
      <main>
        <div className="container">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);