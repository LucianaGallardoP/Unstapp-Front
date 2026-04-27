export const LegalTermsFooter = () => {
  return (
    <footer className="w-full flex justify-center items-center gap-4 py-6 text-[13px] text-gray-400 font-medium">
      <a 
        href="#" 
        onClick={(e) => e.preventDefault()} 
        className="hover:text-gray-700 transition-colors"
      >
        Privacidad
      </a>
      <span className="text-gray-300">•</span>
      <a 
        href="#" 
        onClick={(e) => e.preventDefault()} 
        className="hover:text-gray-700 transition-colors"
      >
        Términos y Condiciones
      </a>
      <span className="text-gray-300">•</span>
      <a 
        href="#" 
        onClick={(e) => e.preventDefault()} 
        className="hover:text-gray-700 transition-colors"
      >
        Soporte
      </a>
    </footer>
  );
};
