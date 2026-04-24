import { useState } from 'react';

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-[400px] p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
      <h1 className="text-[2.5rem] font-bold text-black leading-tight mb-2">
        Bienvenido
      </h1>
      <p className="text-gray-500 text-[15px] mb-8 leading-snug pr-4">
        Accede a tu comunidad académica y gestiona tu vida universitaria.
      </p>

      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        {/* Campo de Email o DNI */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="identifier" className="text-[15px] text-gray-800">
            Email o DNI
          </label>
          <input
            type="text"
            id="identifier"
            placeholder="estudiante@unsta.edu.ar o DNI"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[15px] text-gray-800">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="********"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 placeholder-gray-300 pr-12 text-lg tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 focus:outline-none"
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
          </div>
        </div>

        {/* Recordarme */}
        <div className="flex items-center gap-2.5 mt-1">
          <input
            type="checkbox"
            id="remember"
            className="w-5 h-5 rounded border-gray-300 text-gray-800 focus:ring-gray-800 accent-gray-800 cursor-pointer"
          />
          <label htmlFor="remember" className="text-[15px] text-gray-800 cursor-pointer select-none">
            Recordarme
          </label>
        </div>

        {/* Olvidaste tu contraseña */}
        <div className="text-center mt-2">
          <a href="#" className="text-blue-500 font-medium text-[15px] hover:underline transition-all">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Botón de Iniciar Sesión */}
        <button
          type="submit"
          className="w-full bg-[#4285F4] hover:bg-blue-600 text-white font-medium text-[16px] py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
        >
          Iniciar Sesión
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        {/* Link de Registro */}
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
