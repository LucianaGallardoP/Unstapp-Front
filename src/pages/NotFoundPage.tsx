import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-[4rem] font-bold text-gray-900 leading-tight">
        404 Error
      </h1>
      <p className="text-xl text-gray-500 mb-8 font-medium">
        Page Not Found
      </p>
      
      <div className="w-full max-w-[200px]">
        <Button 
          fullWidth 
          onClick={() => window.history.back()}
        >
          Regresar
        </Button>
      </div>
    </div>
  );
};
