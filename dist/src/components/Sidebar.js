import { useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
} from "reactstrap";

var ps;

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  // toggles collapse between opened and closed (true/false)
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };
  // closes the collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  const { logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>
        {/* Logo */}
        <NavbarBrand className="pt-0" {...navbarBrandProps}>
          <img
            alt={logo.imgAlt}
            className="navbar-brand-img"
            src={logo.imgSrc}
          />
        </NavbarBrand>
        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Navigation - Visualização */}
          <Nav navbar>
            <NavItem className="mb-md-3 ml-1" navbar="true">
              <NavLink
                to={"/admin/index"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Visualização
              </NavLink>
            </NavItem>
          </Nav>
          {/* Divider */}
          <hr className="my-3" />
          {/* Heading - Configurações */}
          <h6 className="navbar-heading text-muted">Configurações</h6>
          {/* Navigation - Configurações */}
          <Nav className="mb-md-3 ml-1" navbar>
            {/* Currículos */}
            <NavItem>
              <NavLink
                to={"/admin/cv-list"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Currículos
              </NavLink>
            </NavItem>
            {/* Grupos */}
            <NavItem>
              <NavLink
                to={"/admin/group-list"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Grupos
              </NavLink>
            </NavItem>
          </Nav>
          {/* Divider */}
          <hr className="my-3" />
          {/* Heading - Informações */}
          <h6 className="navbar-heading text-muted">Informações</h6>
          {/* Navigation - Informações */}
          <Nav className="mb-md-3 ml-1" navbar>
            {/* Dúvidas frequentes */}
            <NavItem>
              <NavLink 
                to={"/admin/questions"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Dúvidas Frequentes
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                to={"/admin/comments"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Comentários
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                to={"/admin/other-infos"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Outras informações
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink 
                to={"/admin/credits"}
                tag={NavLinkRRD}
                onClick={closeCollapse}
              >
                Créditos
              </NavLink>
            </NavItem>
          </Nav>
          {/* GitHub */}
          <Nav className="mb-md-3" navbar>
            <NavItem className="active-pro active">
              <NavLink href="https://github.com/nabormendonca/qlattes" target="_blank">
                <img 
                  alt="GitHub logo"
                  src={require('../assets/img/github-logo.png')} 
                  style={{width:'20px', marginRight: '15px'}}
                />
                © 2023 Versão 0.2.1
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
