import React, { useState, useEffect } from 'react';
import './App.css';

import bgVideo from './assets/video/1-1.mp4';
import axios from './api/axios';

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

export default function App() {

  const [screen, setScreen] = useState('welcome');
  const [page, setPage] = useState('homePage');
  const [cart, setCart] = useState({});
  const [userPhone, setUserPhone] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get('/menu');
        setMenuItems(res.data);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };
    fetchMenu();
  }, []);

  const increase = (id) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrease = (id) => {
    setCart(prev => {
      const current = prev[id] || 0;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const clearCart = () => setCart({});

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find(m => m._id === id);
    return sum + qty * (item ? item.price : 0);
  }, 0);

  // when user logs in — show splash first then go to app
  const handleUserEnter = (phone) => {
    setUserPhone(phone);
    setShowSplash(true);
  };

  return (
    <>
      {/* VIDEO BACKGROUND */}
      <video autoPlay muted loop playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* SPLASH SCREEN - shows after login */}
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            setShowSplash(false);
            setScreen('app');
          }}
        />
      )}

      {/* WELCOME */}
      {screen === 'welcome' && !showSplash && (
        <WelcomePage
          onEnter={handleUserEnter}
          showAdminLogin={() => setScreen('adminLogin')}
        />
      )}

      {/* ADMIN LOGIN */}
      {screen === 'adminLogin' && (
        <AdminLogin
          onLogin={() => setScreen('admin')}
          onBack={() => setScreen('welcome')}
        />
      )}

      {/* ADMIN DASHBOARD */}
      {screen === 'admin' && (
        <AdminDashboard
          onLogout={() => setScreen('welcome')}
        />
      )}

      {/* USER APP */}
      {screen === 'app' && !showSplash && (
        <>
          <Header showPage={setPage} />

          <div className="page-wrapper">

            {page === 'homePage' && (
              <>
                <section className="hero">
                  <div className="side-text left">SCROLL</div>
                  <div className="text left-text">Coffee <br /> makes</div>
                  <div className="text right-text">Everything <br /> better.</div>
                  <div className="side-text right">DOWN</div>
                </section>
                <MenuPage
                  cart={cart}
                  increase={increase}
                  decrease={decrease}
                />
              </>
            )}

            {page === 'cartPage' && (
              <CartPage cart={cart} menuItems={menuItems} />
            )}

            {page === 'billPage' && (
              <BillPage
                cart={cart}
                menuItems={menuItems}
                clearCart={clearCart}
                showPage={setPage}
                userPhone={userPhone}
              />
            )}

            {page === 'historyPage' && (
              <HistoryPage userPhone={userPhone} />
            )}

          </div>

          <CartBar
            totalItems={totalItems}
            totalPrice={totalPrice}
            goToBill={() => setPage('billPage')}
          />
          <BottomNav page={page} showPage={setPage} />
          <Footer />
        </>
      )}
    </>
  );
}