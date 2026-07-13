import { Camera, ImagePlus, Trash2, X } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useLanguage } from '../../../store/languageContext';
import type { ProfileEditValues, ProfileResponseDTO } from '../types/profile.dtos';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: ProfileResponseDTO;
  onClose: () => void;
  onSave: (values: ProfileEditValues) => Promise<void>;
}

const MAX_BIO_LENGTH = 500;
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

const createPreviewUrl = (file?: File) => (file ? URL.createObjectURL(file) : undefined);

export const EditProfileModal = ({
  isOpen,
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const { t } = useLanguage();
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState(profile.coverUrl);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [removeBio, setRemoveBio] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setAvatarFile(undefined);
    setCoverFile(undefined);
    setAvatarPreview(profile.avatarUrl);
    setCoverPreview(profile.coverUrl);
    setBio(profile.bio ?? '');
    setRemoveBio(false);
    setRemoveAvatar(false);
    setRemoveCover(false);
    setSaveError(null);
  }, [isOpen, profile.avatarUrl, profile.bio, profile.coverUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }

      if (coverPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [avatarPreview, coverPreview]);

  if (!isOpen) {
    return null;
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const previewUrl = createPreviewUrl(file);

    if (file && previewUrl) {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
      setRemoveAvatar(false);
    }
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const previewUrl = createPreviewUrl(file);

    if (file && previewUrl) {
      setCoverFile(file);
      setCoverPreview(previewUrl);
      setRemoveCover(false);
    }
  };

  const handleRemoveBio = () => {
    setBio('');
    setRemoveBio(true);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(undefined);
    setAvatarPreview(undefined);
    setRemoveAvatar(true);
  };

  const handleRemoveCover = () => {
    setCoverFile(undefined);
    setCoverPreview(undefined);
    setRemoveCover(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave({
        avatarFile,
        coverFile,
        avatarUrl: avatarPreview,
        coverUrl: coverPreview,
        bio,
        removeBio,
        removeAvatar,
        removeCover,
      });
      onClose();
    } catch {
      setSaveError(t('profile.updateError'));
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
              {t('profile.edit')}
            </h2>
            <p className="mt-1 text-[12px] font-semibold text-gray-500">
              {t('profile.editSubtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="-mr-2 -mt-2 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black disabled:opacity-60"
            aria-label={t('common.close')}
          >
            <X size={19} />
          </button>
        </header>

        <div className="mt-5">
          <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="cover-image">
            {t('profile.coverPhoto')}
          </label>
          <div className="mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            {coverPreview ? (
              <img
                src={coverPreview}
                  alt={t('profile.coverPreviewAlt')}
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center text-gray-400">
                <ImagePlus size={30} />
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-[12px] font-bold text-[#1E4E9D] transition-colors hover:bg-[#dcecff]">
              <ImagePlus size={15} />
              {t('profile.changeCover')}
              <input
                id="cover-image"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="sr-only"
                onChange={handleCoverChange}
                disabled={isSaving}
              />
            </label>
            <button
              type="button"
              onClick={handleRemoveCover}
              disabled={isSaving || (!coverPreview && removeCover)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E7000B]/10 px-3 py-2 text-[12px] font-bold text-[#E7000B] transition-colors hover:bg-[#E7000B]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
              {t('profile.removeCover')}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="avatar-image">
            {t('profile.profilePhoto')}
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={t('profile.avatarPreviewAlt')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera size={24} className="text-gray-400" />
              )}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#EFF6FF] px-3 py-2 text-[12px] font-bold text-[#1E4E9D] transition-colors hover:bg-[#dcecff]">
              <Camera size={15} />
              {t('profile.changePhoto')}
              <input
                id="avatar-image"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="sr-only"
                onChange={handleAvatarChange}
                disabled={isSaving}
              />
            </label>
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isSaving || (!avatarPreview && removeAvatar)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E7000B]/10 px-3 py-2 text-[12px] font-bold text-[#E7000B] transition-colors hover:bg-[#E7000B]/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
              {t('profile.removePhoto')}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[12px] font-black uppercase text-[#1F2937]" htmlFor="profile-bio">
              {t('profile.biography')}
            </label>
            <span className="text-[11px] font-bold text-gray-400">
              {bio.length}/{MAX_BIO_LENGTH}
            </span>
          </div>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => {
              setBio(event.target.value.slice(0, MAX_BIO_LENGTH));
              setRemoveBio(false);
            }}
            maxLength={MAX_BIO_LENGTH}
            rows={5}
            disabled={isSaving}
            className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-3 py-3 text-[13px] leading-5 text-gray-700 outline-none transition-colors focus:border-[#1E4E9D] disabled:bg-gray-100"
            placeholder={t('profile.bioPlaceholder')}
          />
          <button
            type="button"
            onClick={handleRemoveBio}
            disabled={isSaving || (!bio && removeBio)}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#E7000B]/10 px-3 py-2 text-[12px] font-bold text-[#E7000B] transition-colors hover:bg-[#E7000B]/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            {t('profile.removeBiography')}
          </button>
        </div>

        {saveError && (
          <p className="mt-4 rounded-xl border border-[#E7000B]/20 bg-[#E7000B]/10 px-3 py-2 text-center text-[12px] font-bold text-[#E7000B]">
            {saveError}
          </p>
        )}

        <footer className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl px-4 py-2 text-[12px] font-bold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-60"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-[#1E4E9D] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#155DFC] disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? t('profile.savingChanges') : t('profile.saveChanges')}
          </button>
        </footer>
      </section>
    </div>
  );
};
