import logo from '../images/qlattes-logo.png';
import './Header.css';
import {Link, useLocation } from "react-router-dom";

function Header() {
  const path = useLocation().pathname;
  console.log(path);
  return (
    <header className="header">
      <img src={logo} className="logo" alt="logo" />
      <div class="tab">
        <Link to="/index.html" class={path=="/index.html" ? "tablinks active" : "tablinks"}>
          Visualização
        </Link>
        <Link to="/index.html/instructions" class={path=="/index.html/instructions" ? "tablinks active" : "tablinks"}>
          Instruções de uso
        </Link>
        <Link to="/index.html/about" class={path=="/index.html/about" ? "tablinks active" : "tablinks"}>
          Sobre
        </Link>
        <Link to="/index.html/questions" class={path=="/index.html/questions" ? "tablinks active" : "tablinks"}>
          Dúvidas frequentes
        </Link>
      </div>
    </header>
  );
}

export default Header;
