import React, { useState, useEffect } from 'react';
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

export default function App() {

  const [screen, setScreen] = useState('welcome');
  const [page, setPage] = useState('homePage');
  const [cart, setCart] = useState({});
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/menu');
      setMenuItems(res.data);
    } catch (err) { console.error(err); }
  };

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

  const handleUserEnter = (phone) => {
    setUserPhone(phone);
    setShowSplash(true);
  };

  const handleLogout = () => {
    setUserPhone('');
    setUserName('');
    setCart({});
    setScreen('welcome');
    setPage('homePage');
  };

  return (
    <>
      <video autoPlay muted loop playsInline className="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      {showSplash && (
        <SplashScreen onComplete={() => { setShowSplash(false); setScreen('app'); }} />
      )}

      {screen === 'welcome' && !showSplash && (
        <WelcomePage onEnter={handleUserEnter} showAdminLogin={() => setScreen('adminLogin')} />
      )}

      {screen === 'adminLogin' && (
        <AdminLogin onLogin={() => setScreen('admin')} onBack={() => setScreen('welcome')} />
      )}

      {screen === 'admin' && (
        <AdminDashboard onLogout={() => setScreen('welcome')} />
      )}

      {screen === 'app' && !showSplash && (
        <>
          <Header
            showPage={setPage}
            userPhone={userPhone}
            onLogout={handleLogout}
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

            {page === 'cartPage' && <CartPage cart={cart} menuItems={menuItems} />}

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

            {page === 'historyPage' && <HistoryPage userPhone={userPhone} />}

            {page === 'feedbackPage' && <FeedbackPage userPhone={userPhone} userName={userName} />}

            {page === 'analyticsPage' && <AnalyticsDashboard />}

          </div>

          {page !== 'billPage' && (
            <CartBar totalItems={totalItems} totalPrice={totalPrice} goToBill={() => setPage('billPage')} />
          )}

          <BottomNav page={page} showPage={setPage} />
          <Footer />
        </>
      )}
    </>
  );
}