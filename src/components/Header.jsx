// Header.jsx
import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <nav className="navbar">
        <div className="header-left">
            <p className="logo">CardCountLab</p>
        </div>
        <div className="header-center">
            <Link to="/">Home</Link>
            <Link to="/practice">Practice Mode</Link>
            <Link to="/">Features</Link>
            <Link to="/">FAQ</Link>
            <Link to="/">Pricing</Link>
        </div>
        <div className="header-right">
            <button className="login-button">Learn Now</button>
        </div>
    </nav>
  );
};

export default Header;