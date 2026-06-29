import { Routes, Route } from 'react-router-dom'
import Registerpage from './pages/Registerpage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtecetedRoute'
import Transaction from './pages/TransactionPage'
import UserPage from './pages/UserPage'
import OCRPage from './pages/OcrPage'
import QrPage from './pages/QrPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { USER_ROLE } from './utils/constant'
import ParkingFees from './pages/ParkingFee'
import EditProfile from './pages/EditProfile'
import RegisterFace from './pages/AdminFaceRegister'
import AdminFaceLogin from './pages/AdminPageLogin'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/userpage" element={ <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN, USER_ROLE.USER]}><UserPage /></ProtectedRoute> } />
      <Route path="/edit-profile" element={<EditProfile />}/>
      <Route
        path="/qr"
        element={
          
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <QrPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <Transaction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
       <Route
        path="/fees"
        element={
          
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <ParkingFees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ocr"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <OCRPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/face-register"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <RegisterFace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-face"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <AdminFaceLogin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ocr"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLE.ADMIN]}>
            <AdminFaceLogin />
          </ProtectedRoute>
        }
      />

      <Route path="reset-password-request" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  )
}

export default App