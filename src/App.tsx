import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth';
import { FeedPage } from './features/feed';
import { ProfilePage } from './features/profile';
import { CalendarPage } from './features/calendar';
import { SchedulePage } from './features/schedule';
import { NotFoundPage } from './pages/NotFoundPage';
import { TestPage } from './pages/TestPage';
import { NotificationsProvider } from './store/notificationsContext';

function App() {
  return (
    <NotificationsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/comunidad" element={<TestPage activeTab="comunidad" />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/horario" element={<SchedulePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/:userId" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </NotificationsProvider>
  );
}

export default App;
