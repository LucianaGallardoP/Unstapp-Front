import { Link } from 'react-router-dom';

const footerLinks = ['Privacidad', 'Términos y Condiciones', 'Soporte'];

export const LegalTermsFooter = () => {
  return (
    <footer className="flex w-full items-center justify-center gap-4 py-6 text-[13px] font-medium text-gray-400">
      {footerLinks.map((label, index) => (
        <span key={label} className="flex items-center gap-4">
          {index > 0 && <span className="text-gray-300">•</span>}
          <Link
            to="/404"
            className="transition-colors hover:text-[#122b54]"
          >
            {label}
          </Link>
        </span>
      ))}
    </footer>
  );
};
