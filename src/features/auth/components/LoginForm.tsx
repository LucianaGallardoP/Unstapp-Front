import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos el hook de navegación [cite: 2083]
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { useLogin } from '../hooks/useLogin'; 

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // 2. Inicializamos el navegador [cite: 2083]
  
  // Inicializamos el hook para obtener la lógica de conexión con .NET [cite: 2048, 2049]
  const { login, loading, error } = useLogin(); 

  // Estado local para controlar los campos del formulario [cite: 2069, 2070]
  const [formData, setFormData] = useState({
    dni: '',
    password: ''
  });

  // Manejador del envío del formulario [cite: 2069, 2073]
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Llamamos a la función login del hook con los datos actuales [cite: 2069]
      await login(formData); 
      
      // 3. ¡Redirección exitosa! Navegamos al feed [cite: 2084]
      console.log("¡Inicio de sesión exitoso! Redirigiendo al feed...");
      navigate('/feed'); 
      
    } catch (err) {
      // El error ya es capturado y gestionado visualmente por el hook [cite: 2048, 2072]
    }
  };

  return (
    <div className="w-full max-w-[400px] p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
      <h1 className="text-[2.5rem] font-bold text-black leading-tight mb-2">
        Bienvenido
      </h1>
      <p className="text-gray-500 text-[15px] mb-8 leading-snug pr-4">
        Accede a tu comunidad académica y gestiona tu vida universitaria.
      </p>

      {/* Conectamos el handleSubmit al formulario [cite: 2069] */}
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        
        {/* Mostramos el mensaje de error si la API de .NET falla (ej: DNI no encontrado)  */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        {/* Campo de DNI controlado por el estado [cite: 2070] */}
        <Input
          label="DNI"
          id="dni"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ingresa tu DNI"
          className="placeholder-gray-400"
          value={formData.dni} 
          disabled={loading} // Bloqueamos durante la carga 
          onChange={(e: any) => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
        />

        {/* Campo de Contraseña controlado por el estado [cite: 2070] */}
        <Input
          label="Contraseña"
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="********"
          className={showPassword ? "placeholder-gray-400" : "placeholder-gray-300 text-lg tracking-widest"}
          value={formData.password} 
          disabled={loading} 
          onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-blue-600 hover:text-blue-700 focus:outline-none"
              disabled={loading}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          }
        />

        <div className="flex items-center gap-2.5 mt-1">
          <input
            type="checkbox"
            id="remember"
            className="w-5 h-5 rounded-[4px] border-gray-300 text-gray-800 focus:ring-gray-800 accent-gray-800 cursor-pointer"
            disabled={loading}
          />
          <label htmlFor="remember" className="text-[15px] text-gray-800 cursor-pointer select-none">
            Recordarme
          </label>
        </div>

        <div className="text-center mt-2">
          <a 
            href="/forgot-password" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password'); // Ruta que no existe, activará el 404
            }}
            className="text-blue-500 font-medium text-[15px] hover:underline transition-all"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón dinámico: cambia texto y se bloquea durante la carga  */}
        <Button type="submit" fullWidth className="mt-2" disabled={loading}> 
          {loading ? (
            <span className="flex items-center gap-2">
              Iniciando sesión...
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </span>
          )}
        </Button>

        <div className="text-center mt-4">
          <span className="text-gray-500 text-[15px]">¿No tienes cuenta? </span>
          <a href="#" className="text-[#0056D2] font-bold text-[15px] hover:underline transition-all">
            Regístrate
          </a>
        </div>
      </form>
    </div>
  );
};