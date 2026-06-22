import { useState, type ChangeEvent } from 'react';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import unstaLogo from '../../../assets/img/UNSTA-logo.png'; 

interface RegisterFormProps {
  onLoginClick?: () => void;
}

export const RegisterForm = ({ onLoginClick }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    codigo: '',
    email: '',
    password: '',
    repeatPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implementar lógica de registro real
      console.log("Registrando usuario...", formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = 
    formData.nombre && 
    formData.apellido && 
    formData.codigo && 
    formData.email && 
    formData.password && 
    formData.repeatPassword &&
    formData.password === formData.repeatPassword;

  return (
    <div className="flex flex-col items-center w-full max-w-[400px]">
      <div className="w-full p-8 md:p-10 bg-white border border-gray-200 rounded-[2.5rem]">
        <div className="mb-6 flex justify-center">
          <img src={unstaLogo} alt="Logo UNSTA" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-[2.5rem] font-bold text-black text-center leading-tight mb-2">
          Bienvenido
        </h1>
        <p className="text-gray-500 text-[15px] text-center mb-8 leading-snug">
          Crea tu cuenta y comienza a formar parte de tu comunidad académica.
        </p>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          
          <Input
            label="Nombre"
            id="nombre"
            type="text"
            placeholder="Juan"
            className="placeholder-gray-400"
            value={formData.nombre} 
            disabled={loading} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, nombre: e.target.value });
            }}
          />

          <Input
            label="Apellido"
            id="apellido"
            type="text"
            placeholder="Pérez"
            className="placeholder-gray-400"
            value={formData.apellido} 
            disabled={loading} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, apellido: e.target.value });
            }}
          />

          <Input
            label="Código de Alumno"
            id="codigo"
            type="text"
            placeholder="UIA..."
            className="placeholder-gray-400"
            value={formData.codigo} 
            disabled={loading} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, codigo: e.target.value });
            }}
          />

          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="estudiante@unsta.edu.ar"
            className="placeholder-gray-400"
            value={formData.email} 
            disabled={loading} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData({ ...formData, email: e.target.value });
            }}
          />

          <div className="flex flex-col">
            <Input
              label="Contraseña"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className={showPassword ? "placeholder-gray-400" : "placeholder-gray-300 text-lg tracking-widest"}
              value={formData.password} 
              disabled={loading} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, password: e.target.value });
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#1E4E9D] hover:text-[#122b54] focus:outline-none"
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
          </div>

          <div className="flex flex-col">
            <Input
              label="Repetir contraseña"
              id="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              placeholder="********"
              className={showRepeatPassword ? "placeholder-gray-400" : "placeholder-gray-300 text-lg tracking-widest"}
              value={formData.repeatPassword} 
              disabled={loading} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, repeatPassword: e.target.value });
              }}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="text-[#1E4E9D] hover:text-[#122b54] focus:outline-none"
                  disabled={loading}
                >
                  {showRepeatPassword ? (
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
          </div>

          <Button 
            type="submit" 
            fullWidth 
            className="mt-2 hover:bg-[#122b54]" 
            disabled={loading || !isFormValid}
          > 
            {loading ? (
              <span className="flex items-center gap-2">
                Registrando...
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Registrarse
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            )}
          </Button>

        </form>
      </div>

      <div className="text-center mt-6">
        <span className="text-gray-500 text-[15px]">¿Ya tienes cuenta? </span>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onLoginClick) onLoginClick();
          }}
          className="text-[#1E4E9D] font-bold text-[15px] hover:text-[#122b54] hover:underline transition-all"
        >
          Inicia Sesión
        </button>
      </div>
    </div>
  );
};
