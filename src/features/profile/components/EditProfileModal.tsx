import { Camera, ImagePlus, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import type { ProfileEditValues, ProfileResponseDTO } from '../types/profile.dtos';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: ProfileResponseDTO;
  onClose: () => void;
  onSave: (values: ProfileEditValues) => Promise<void>;
}

const MAX_BIO_LENGTH = 250;

const createPreviewUrl = (file?: File) => (file ? URL.createObjectURL(file) : undefined);

export const EditProfileModal = ({
  isOpen,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(profile.coverUrl);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setAvatarPreview(profile.avatarUrl);
    setCoverPreview(profile.coverUrl);
    setBio(profile.bio ?? '');
  }, [isOpen, profile.avatarUrl, profile.bio, profile.coverUrl]);

  if (!isOpen) {
    return null;
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const previewUrl = createPreviewUrl(event.target.files?.[0]);

    if (previewUrl) {
      setAvatarPreview(previewUrl);
    }
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const previewUrl = createPreviewUrl(event.target.files?.[0]);

    if (previewUrl) {
      setCoverPreview(previewUrl);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave({
        avatarUrl: avatarPreview,
        coverUrl: coverPreview,
        bio,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <section className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-[22px] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-black uppercase text-black">
              Editar Perfil
            </h2>
            <p className="mt-1 text-[12px] font-semibold text-gray-500">
              Actualiza tus fotos y biografía.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black disabled:opacity-60"
            aria-label="Cerrar modal"
          >
            <X size={19} />
          </button>
        </header>

        <div className="mt-5">
          <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="cover-image">
            Foto de portada
          </label>
          <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Previsualización de portada"
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                <ImagePlus size={30} />
              </div>
            )}
          </div>
          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-[12px] font-bold text-[#1E4E9D] transition-colors hover:bg-[#dcecff]">
            <ImagePlus size={15} />
            Cambiar portada
            <input
              id="cover-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleCoverChange}
              disabled={isSaving}
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="avatar-image">
            Foto de perfil
          </label>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Previsualización de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera size={24} className="text-gray-400" />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-[12px] font-bold text-[#1E4E9D] transition-colors hover:bg-[#dcecff]">
              <Camera size={15} />
              Cambiar foto
              <input
                id="avatar-image"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={isSaving}
              />
            </label>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="profile-bio">
              Biografía
            </label>
            <span className="text-[11px] font-bold text-gray-400">
              {bio.length}/{MAX_BIO_LENGTH}
            </span>
          </div>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value.slice(0, MAX_BIO_LENGTH))}
            maxLength={MAX_BIO_LENGTH}
            rows={5}
            disabled={isSaving}
            className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-3 py-3 text-[13px] leading-5 text-gray-700 outline-none transition-colors focus:border-[#1E4E9D] disabled:bg-gray-100"
            placeholder="Contá algo sobre vos..."
          />
        </div>

        <footer className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl px-4 py-2 text-[12px] font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#1E4E9D] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#155DFC] disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </footer>
      </section>
    </div>
  );
};
