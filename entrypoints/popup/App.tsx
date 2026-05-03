import { useEffect, useState } from 'react';
import { DEFAULT_PFM_SETTINGS, PFM_SETTINGS_STORAGE_KEY } from '../../config/pfm-settings';
import './App.css';

function App() {
  const [clinicTitle, setClinicTitle] = useState(DEFAULT_PFM_SETTINGS.clinicTitle);

  useEffect(() => {
    void browser.storage.local.get(PFM_SETTINGS_STORAGE_KEY).then((raw) => {
      const settings = raw[PFM_SETTINGS_STORAGE_KEY] as { clinicTitle?: string } | undefined;
      if (settings?.clinicTitle) setClinicTitle(settings.clinicTitle);
    });
  }, []);

  return (
    <div className="popup-root">
      <div className="popup-title">{clinicTitle}</div>
    </div>
  );
}

export default App;
