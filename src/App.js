import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

import bgVideo from './assets/video/1-1.mp4';
import axios from './api/axios';

import coffeeImg from './assets/images/coffee.png';
import coldcoffeeImg from './assets/images/coldcoffee.png';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CartBar from './components/CartBar';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';

import WelcomePage from './pages/WelcomePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import BillPage from './pages/BillPage';
import HistoryPage from './pages/HistoryPage';
import FeedbackPage from './pages/FeedbackPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TableStatusPage from './pages/TableStatusPage';

const SESSION_TIMEOUT = 10 * 60 * 1000;
const USER_SESSION_KEY = 'cafeUserSession';
const ADMIN_SESSION_KEY = 'cafeAdminSession';

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [page, setPage] = useState('homePage');
  const [cart, setCart] = useState({});
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [showSplash, setShowSplash] = useState(false);

  const userTimerRef = useRef(null);
  const adminTimerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const elapsed = Date.now() - session.loginTime;
        if (elapsed < SESSION_TIMEOUT && session.phone) {
          setUserPhone(session.phone);
          setScreen('app');
          startUserTimer(SESSION_TIMEOUT - elapsed);
        } else {
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }
    } catch (e) {
      localStorage.removeItem(USER_SESSION_KEY);
    }

    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const elapsed = Date.now() - session.loginTime;
        if (elapsed < SESSION_TIMEOUT && session.token) {
          localStorage.setItem('adminToken', session.token);
          setScreen('admin');
          startAdminTimer(SESSION_TIMEOUT - elapsed);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem('adminToken');
        }
      }
    } catch (e) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem('adminToken');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/menu');
      setMenuItems(res.data);
    } catch (err) { console.error(err); }
  };

  const startUserTimer = useCallback((duration = SESSION_TIMEOUT) => {
    if (userTimerRef.current) clearTimeout(userTimerRef.current);
    userTimerRef.current = setTimeout(() => {
      alert('⏰ Your session has expired after 10 minutes. Please login again.');
      handleUserLogout();
    }, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAdminTimer = useCallback((duration = SESSION_TIMEOUT) => {
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    adminTimerRef.current = setTimeout(() => {
      alert('⏰ Admin session expired after 10 minutes. Please login again.');
      handleAdminLogout();
    }, duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserEnter = (phone) => {
    setUserPhone(phone);
    setShowSplash(true);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify({ phone, loginTime: Date.now() }));
    startUserTimer();
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setScreen('app');
  };

  const handleUserLogout = useCallback(() => {
    if (userTimerRef.current) clearTimeout(userTimerRef.current);
    localStorage.removeItem(USER_SESSION_KEY);
    setUserPhone('');
    setUserName('');
    setCart({});
    setPage('homePage');
    setScreen('welcome');
  }, []);

  const handleAdminLogin = () => {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      token: 'garima-admin-secret-token',
      loginTime: Date.now(),
    }));
    setScreen('admin');
    startAdminTimer();
  };

  const handleAdminLogout = useCallback(() => {
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('adminToken');
    setScreen('welcome');
  }, []);

  const increase = (id) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  const decrease = (id) => setCart(prev => {
    const current = prev[id] || 0;
    if (current <= 0) return prev;
    return { ...prev, [id]: current - 1 };
  });

  const clearCart = () => setCart({});

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find(m => m._id === id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  return (
    <>
      <video autoPlay muted loop playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {screen === 'welcome' && !showSplash && (
        <WelcomePage
          onEnter={handleUserEnter}
          showAdminLogin={() => setScreen('adminLogin')}
        />
      )}

      {screen === 'adminLogin' && (
        <AdminLogin onLogin={handleAdminLogin} onBack={() => setScreen('welcome')} />
      )}

      {screen === 'admin' && (
        <AdminDashboard onLogout={handleAdminLogout} />
      )}

      {screen === 'app' && !showSplash && (
        <>
          <Header
            showPage={setPage}
            userPhone={userPhone}
            onLogout={handleUserLogout}
          />

          <div className="page-wrapper">

            {page === 'homePage' && (
              <>
                <section className="hero">
                  <div className="side-text left">SCROLL</div>
                  <div className="text left-text">Coffee <br /> makes</div>
                  <div className="text right-text">Everything <br /> better.</div>
                  <div className="side-text right">DOWN</div>
                  <img src={coffeeImg} className="choco left-choco" alt="coffee" />
                  <img src={coldcoffeeImg} className="choco right-choco" alt="cold coffee" />
                </section>
                <div className="our-menu-heading"><h2>Our Menu</h2></div>
                <MenuPage
                  cart={cart}
                  increase={increase}
                  decrease={decrease}
                  menuItems={menuItems}
                  onMenuLoaded={(items) => setMenuItems(items)}
                />
              </>
            )}
{page === 'cartPage' && (
  <CartPage
    cart={cart}
    menuItems={menuItems}
    showPage={setPage}
    increase={increase}
    decrease={decrease}
  />
)}

            {page === 'billPage' && (
              <BillPage
                cart={cart}
                menuItems={menuItems}
                clearCart={clearCart}
                showPage={setPage}
                userPhone={userPhone}
                onNameSet={setUserName}
              />
            )}

            {page === 'historyPage' && (
              <HistoryPage userPhone={userPhone} />
            )}

            {page === 'feedbackPage' && (
              <FeedbackPage userPhone={userPhone} userName={userName} />
            )}

            {page === 'analyticsPage' && (
              <AnalyticsDashboard />
            )}

            {page === 'tableStatusPage' && (
              <TableStatusPage userPhone={userPhone} />
            )}

          </div>

          {page !== 'billPage' && (
            <CartBar
              totalItems={totalItems}
              totalPrice={totalPrice}
              goToBill={() => setPage('billPage')}
              cart={cart}
              menuItems={menuItems}
            />
          )}

          <BottomNav page={page} showPage={setPage} />
          <Footer />
        </>
      )}
    </>
  );
}