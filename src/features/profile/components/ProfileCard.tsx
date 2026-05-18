interface ProfileCardProps {
  userName?: string;
  role?: string;
  bio?: string;
  stats?: {
    posts: string | number;
    followers: string | number;
    following: string | number;
  };
}

export const ProfileCard = ({
  userName = 'Luciana Gallardo',
  role = 'ESTUDIANTE DE INGENIERÍA DE SOFTWARE',
  bio = 'Apasionada por la tecnología y el desarrollo de software. Siempre buscando aprender algo nuevo y compartir conocimiento con la comunidad UNSTA. 🚀',
  stats = {
    posts: '124',
    followers: '1.2k',
    following: '850',
  }
}: ProfileCardProps) => {
  return (
    <article className="relative mx-auto w-full max-w-[430px] overflow-hidden rounded-[16px] border border-gray-200 bg-white pb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-[560px] md:max-w-[600px]">
      {/* Espacio para la foto de portada (vacio) */}
      <div className="h-32 w-full bg-gray-200 sm:h-40"></div>

      {/* Contenedor del Avatar y Botón de Editar */}
      <div className="px-5 flex items-end justify-between -mt-10 mb-3 sm:-mt-12 sm:mb-4">
        {/* Espacio para la foto de perfil (vacio) */}
        <div className="relative h-[84px] w-[84px] shrink-0 rounded-[18px] border-[3px] border-white bg-gray-300 shadow-sm sm:h-[100px] sm:w-[100px]"></div>

        {/* Botón Editar Perfil */}
        <button 
          type="button"
          className="mb-1 h-8 rounded-lg bg-[#F0F2F5] px-4 text-[12px] font-bold text-gray-900 transition-colors hover:bg-[#E4E6E9] sm:h-9 sm:px-5 sm:text-[13px]"
        >
          Editar Perfil
        </button>
      </div>

      {/* Información del Perfil */}
      <div className="px-5">
        <h2 className="text-[22px] font-black tracking-tight text-black sm:text-[24px]">
          {userName}
        </h2>
        <p className="mt-0.5 text-[11px] font-bold uppercase text-[#155DFC] sm:text-[12px]">
          {role}
        </p>

        <p className="mt-3 text-[13px] leading-snug text-gray-500 sm:text-[14px]">
          {bio}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mt-6 flex justify-center gap-6 px-5 sm:gap-10">
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{stats.posts}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">PUBLICACIONES</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{stats.followers}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">SEGUIDORES</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[18px] font-black leading-none text-black sm:text-[20px]">{stats.following}</span>
          <span className="mt-1 text-[10px] font-bold text-gray-500 sm:text-[11px]">SIGUIENDO</span>
        </div>
      </div>
    </article>
  );
};
