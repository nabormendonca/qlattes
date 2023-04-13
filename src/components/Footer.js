import './Footer.css';
import githubLogo from '../images/github-logo.png';
import logo from '../images/qlattes-logo.png';
import {Link} from "react-router-dom";

function Footer() {
  return (
    <div class="footer">
      <div class="footer-section">
        <img src={logo} className="logo" alt="logo" />
      </div>
      <div class="footer-section">
        <p class="footer-section-header">Inicio</p>
        <Link to="/index.html">Visualização</Link>
        <Link to="/index.html/instructions">Instruções de uso</Link>
        <Link to="/index.html/about">Sobre</Link>
        <Link to="/index.html/questions">Dúvidas frequentes</Link>
      </div>
      <div class="footer-section">
        <p class="footer-section-header">Informações</p>
        <Link to="/index.html/data-information">Fonte de dados</Link>
        <Link to="/index.html/future-enhancement">Melhorias futuras</Link>
        <Link to="/index.html/privacy-policy">Politica de privacidade</Link>
      </div>
      <div class="footer-section">
        <p class="footer-section-header">Suporte</p>
        <Link to="/index.html/comments">Comentários e sugestões</Link>
        <Link to="/index.html/questions">Dúvidas frequentes</Link>
      </div>
      <div class="footer-section">
        <p class="footer-section-header">Sobre</p>
        <p>Write something about the extension</p>
        <Link to="/index.html/credits">Créditos</Link>
      </div>
      <div class="footer-section">
        <p>By <a href="https://sites.google.com/site/nabormendonca/" target="_blank">Nabor Mendonça</a></p>
        <p id="qlattes-version">
          Versão 0.1.7 © 2023
        </p>
        <a href="https://github.com/nabormendonca/qlattes" target="_blank"
          ><img
            id="github-logo"
            src={githubLogo}
            alt="QLattes@GitHub"
        /></a>
      </div>
    </div>
  );
}

export default Footer;
