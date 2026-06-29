import { Link, useNavigate } from 'react-router-dom';
import '../css/homepage.css'
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const HomePage = () => {
  const { userData, backendUrl, setUserData, setIsLoggedin, isAdmin } = useContext(AppContext)
  const navigate = useNavigate()

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true
      const { data } = await axios.post(backendUrl + '/api/auth/logout')
      data.success && setIsLoggedin(false)
      data.success && setUserData(false)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="home">

      <nav className="navbar">
        <div className="logo">⚡ Smart Parking</div>
        {userData
          ? <div className="user-icon">
              {userData.name[0].toUpperCase()}
              <div className="user-icon-hover-box">
                <ul>
                  {isAdmin && <li onClick={() => navigate('/transactions')}>Transactions</li>}
                  {isAdmin && <li onClick={() => navigate('/admin')}>Admin Page</li>}
                  {isAdmin && <li onClick={() => navigate('/ocr')}> OCR Scanner </li>}
                  {isAdmin && <li onClick={() => navigate('/fees')}>Fees Management</li>}
                  {isAdmin && <li onClick={() => navigate('/qr')}>QR Scanner</li>}
                  <li onClick={() => navigate('/edit-profile')}>Edit Profile</li>
                  <li onClick={logout}>Log Out</li>
                </ul>
              </div>
            </div>
          : <div className="nav-links">
              <button className="login-btn"><Link className="navlink" to="/login">Login</Link></button>
              <button className="register-btn"><Link className="navlink" to="/register">Register</Link></button>
            </div>
        }
      </nav>

      <section className="hero-section">

        <div className="hero-left">
          <div className="hero-badge">⚡ Smart. Fast. Cashless.</div>

          <h1>
            Park smarter,<br />
            pay <span className="hero-accent">effortlessly</span>
          </h1>

          <p className="hero-sub">
            Manage your parking wallet, track every transaction, and
            scan your QR to enter — all in one place.
          </p>

        {!userData && (
  <div className="hero-cta-row">
    <button className="start-btn" onClick={() => navigate('/login')}>
      Get Started
    </button>
    <button className="outline-btn" onClick={() => navigate('/register')}>
      Register
    </button>
  </div>
)}

          <div className="feature-chips">
            <div className="chip" onClick={() => navigate('/userpage')}> Digital Wallet</div>
            <div className="chip" onClick={() => navigate('/userpage')}> QR Based Entry</div>
            <div className="chip" onClick={() => navigate('/userpage')}> Transactions</div>
          </div>
        </div>

      </section>

      <section className="stats-bar">
        <div className="stat-item">
          <p className="stat-num">10k+</p>
          <p className="stat-lbl">Registered users</p>
        </div>
        <div className="stat-item">
          <p className="stat-num">50k+</p>
          <p className="stat-lbl">Transactions processed</p>
        </div>
        <div className="stat-item">
          <p className="stat-num">99.9%</p>
          <p className="stat-lbl">Uptime</p>
        </div>
        <div className="stat-item">
          <p className="stat-num">&lt;2s</p>
          <p className="stat-lbl">Avg. QR scan time</p>
        </div>
      </section>

      <section className="why-section">
        <p className="why-label">WHY SMART PARKING</p>
        <h2 className="why-heading">Everything you need, nothing you don't</h2>

        <div className="why-cards">
          <div className="why-card" onClick={() => navigate('/userpage')}>
            <div className="why-icon"></div>
            <h3>Digital Wallet</h3>
            <p>Top up once and pay seamlessly every visit — no cash, no hassle.</p>
          </div>
          <div className="why-card" onClick={() => navigate('/userpage')}>
            <div className="why-icon"></div>
            <h3>QR Based Entry</h3>
            <p>Scan your unique QR at the gate for instant, contactless access.</p>
          </div>
          <div className="why-card" onClick={() => navigate('/userpage')}>
            <div className="why-icon"></div>
            <h3>Transactions</h3>
            <p>Full history of every debit and credit — always transparent.</p>
          </div>
        </div>
      </section>

    </div>
  )
}

export default HomePage