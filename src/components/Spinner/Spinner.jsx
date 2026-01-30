import './Spinner.css';
import { CircleLoader } from "react-spinners";

export default function Spinner () {
  
  return (
    <div className="spinner-container">
      <CircleLoader color="#4d11f4b1" size={80} />
      <p className="spinner-text gradient-text">Loading...</p>
    </div>

  );
};
