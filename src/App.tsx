import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth';
import { FeedPage } from './features/feed';
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
          <Route path="/calendario" element={<TestPage activeTab="calendario" />} />
          <Route path="/horario" element={<TestPage activeTab="horario" />} />
          <Route path="/perfil" element={<TestPage activeTab="perfil" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </NotificationsProvider>
  );
}

export default App;
