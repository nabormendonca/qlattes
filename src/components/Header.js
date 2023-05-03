import logo from '../images/qlattes-logo.png';
import './Header.css';
import {Link, useLocation } from "react-router-dom";
import { useState } from 'react';
import githubLogo from '../images/github-logo.png';

const menu = {
  'Visualização': {
    link: "/index.html",
    children: []
  },
  'Informações': {
    children: [
      {name: 'Dúvidas frequentes', link: "/index.html/questions"},
      {name: 'Comentários e sugestões', link: "/index.html/comments"}
    ]
  },
  'Sobre': {
    children: [
      {name: 'Fonte de dados', link: "/index.html/data-information"}, 
      {name: 'Melhorias futuras', link: "/index.html/future-enhancement"},
      {name: 'Politica de privacidade', link: "/index.html/privacy-policy"},
    ]
  },
};

function Menu(path) {
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleMenuClick = (menu) => {
    if (selectedMenu === menu) {
      setSelectedMenu(null);
    } else {
      setSelectedMenu(menu);
    }
  }
  console.log('oi: ', path, '=> ', path.path);

  return (
    <nav class="tab">
      <ul class="tab-list">
        {Object.entries(menu).map(([parent, attributes]) => (
          <li key={parent} onMouseEnter={() => handleMenuClick(parent)} onMouseLeave={() => handleMenuClick(parent)} >
            {attributes.link ?
              <Link to={attributes.link} class={path.path==attributes.link ? "parent tablinks active" : "parent tablinks"}>
                {parent}
              </Link>
            : <div class={attributes.children.filter(child => path.path==child.link).length!==0 ? "parent tablinks active" : "parent tablinks"}>
              {parent}
            </div>}
            {selectedMenu === parent && attributes.children.length !== 0 && (
              <ul class="child-wrapper">
                {attributes.children.map(child => (
                  <li key={child.name}>
                    {child.link ?
                      <Link to={child.link} class={path.path==child.link ? "children tablinks active" : "children tablinks"}>
                        {child.name}
                      </Link>
                    : child.name }
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Header() {
  const path = useLocation().pathname;

  return (
    <header className="header">
      <img src={logo} className="logo" alt="logo" />
      <Menu path={path}/>
      <div class="footer-section">
        <p>By <a href="https://sites.google.com/site/nabormendonca/" target="_blank">Nabor Mendonça</a></p>
        <p id="qlattes-version">
          <a href="https://github.com/nabormendonca/qlattes" target="_blank" >
            <img
              id="github-logo"
              src={githubLogo}
              alt="QLattes@GitHub"
            />
          </a>
          Versão 0.2.1 © 2023
        </p>
      </div>
    </header>
  );
}

export default Header;
