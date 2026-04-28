// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth'; // Importación limpia vía Portero [cite: 1836, 2045]
import { FeedPage } from './features/feed';   // Importación limpia vía Portero [cite: 1849, 1945]
import { NotFoundPage } from './pages/NotFoundPage';        // Importación limpia desde el Portero global [cite: 1929, 1930]

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial: Si el usuario entra a "/", lo enviamos al login [cite: 1940] */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Páginas de las Features */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<FeedPage />} />
        
        {/* Manejo de error 404: Captura cualquier ruta inexistente [cite: 1946, 1962] */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
