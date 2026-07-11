import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './features/auth';
import { FeedPage } from './features/feed';
import { ProfilePage } from './features/profile';
import { CalendarPage } from './features/calendar';
import { ScheduleEntryPage, SchedulePage } from './features/schedule';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotificationsProvider } from './store/notificationsContext';
import { AuthProvider } from './store/authContext';
import { ThemeProvider } from './store/themeContext';
import { LanguageProvider } from './store/languageContext';

const passwordRoutes = [
  '/register',
  '/register/:token',
  '/set-password',
  '/set-password/:token',
  '/reset-password',
  '/reset-password/:token',
  '/crear-clave',
  '/crear-clave/:token',
  '/crear-contrasena',
  '/crear-contrasena/:token',
  '/crear-contraseña',
  '/crear-contraseña/:token',
  '/restablecer-clave',
  '/restablecer-clave/:token',
  '/restablecer-contrasena',
  '/restablecer-contrasena/:token',
  '/restablecer-contraseña',
  '/restablecer-contraseña/:token',
  '/cambiar-clave',
  '/cambiar-clave/:token',
  '/cambiar-contrasena',
  '/cambiar-contrasena/:token',
  '/cambiar-contraseña',
  '/cambiar-contraseña/:token',
  '/auth/set-initial-password',
  '/Auth/set-initial-password',
];

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {passwordRoutes.map((path) => (
                  <Route key={path} path={path} element={<RegisterPage />} />
                ))}
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
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
