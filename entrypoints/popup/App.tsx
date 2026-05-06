import './App.css';
import logoDts from '../../assets/logo_dts.png';

function App() {
  return (
    <div className="popup-root">
      <img src={logoDts} alt="DTS logo" className="popup-logo" />
      <div className="popup-title">Phòng khám Đa khoa ĐTS</div>
    </div>
  );
}

export default App;
