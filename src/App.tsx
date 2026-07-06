import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './features/auth';
import { FeedPage } from './features/feed';
import { ProfilePage } from './features/profile';
import { CalendarPage } from './features/calendar';
import { ScheduleEntryPage, SchedulePage } from './features/schedule';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotificationsProvider } from './store/notificationsContext';
import { AuthProvider } from './store/authContext';

function App() {
  return (
    <NotificationsProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/:token" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/set-password" element={<RegisterPage />} />
            <Route path="/set-password/:token" element={<RegisterPage />} />
            <Route path="/reset-password" element={<RegisterPage />} />
            <Route path="/reset-password/:token" element={<RegisterPage />} />
            <Route path="/crear-contrasena" element={<RegisterPage />} />
            <Route path="/crear-contrasena/:token" element={<RegisterPage />} />
            <Route path="/crear-contraseña" element={<RegisterPage />} />
            <Route path="/crear-contraseña/:token" element={<RegisterPage />} />
            <Route path="/crear-clave" element={<RegisterPage />} />
            <Route path="/crear-clave/:token" element={<RegisterPage />} />
            <Route path="/auth/set-initial-password" element={<RegisterPage />} />
            <Route path="/Auth/set-initial-password" element={<RegisterPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route path="/horario" element={<ScheduleEntryPage />} />
            <Route path="/admin/horarios/:careerId" element={<SchedulePage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/perfil/:userId" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </NotificationsProvider>
  );
}

export default App;
