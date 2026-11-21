import type { IProfile } from "./profile.interface";
import { profileRepository } from "./profile.repository";

const createProfile = async (payload: IProfile) => {
  const exists = await profileRepository.userExists(payload.user_id);

  if (!exists) return null;

  return await profileRepository.create(payload);
};

export const profileService = { createProfile };
