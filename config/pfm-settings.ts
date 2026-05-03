export const PFM_SETTINGS_STORAGE_KEY = 'pfm-extension-settings';
export const PFM_SAVED_PATIENTS_STORAGE_KEY = 'pfm-saved-patients';

export interface PfmSettings {
  apiBaseUrl: string;
  token: string;
  roomId: string;
  clinicTitle: string;
}

export const DEFAULT_PFM_SETTINGS: PfmSettings = {
  apiBaseUrl: 'http://localhost:3000',
  token: '',
  roomId: 'room_x_quang',
  clinicTitle: 'Phòng khám PFM',
};

export interface SavedPatient {
  patient_id: string;
  queue_id: string;
  queue_number: number;
  his_id: string;
  full_name: string;
  dob: string;
  address: string;
  room_id: string;
  created_at: string;
}
