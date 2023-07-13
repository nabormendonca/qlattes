import React, { useEffect, useState } from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "components/Sidebar.js";

import { getAreasData, getLattesData, getGroups } from './utils';
import Index from "views/Index.js";
import GroupList from "views/GroupList.js";
import CVList from "views/CVList.js";
import Comments from "views/Comments";
import Questions from "views/Questions";
import OtherInfos from "views/OtherInfos";
import Credits from "views/Credits";

const IndexLayout = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const [allQualisScores, setAllQualisScores] = useState([]);
  const [area, setArea] = useState({});
  const [authors, setAuthors] = useState([]);
  const [groups, setGroups] = useState({});
  const [authorsNameLink, setAuthorsNameLink] = useState([]);

  async function getInfos() {
    // Get Qualis Scores
    setAllQualisScores(await getAreasData());
    setGroups(await getGroups());

    // Update area data (if previously saved in local store)
    // const data = await getArea();
    // if (Object.keys(data).length > 0) {
    //   setArea(data.area_data);
    // }

    // Get Authors
    getLattesData().then(async (authorList) => {
      if (authors.length === 0 && authorList.length !== 0) {
        setAuthors(authorList);
        setAuthorsNameLink(Object.entries(authorList).map(author =>( {link: author[0],name: author[1].name})));
      }
    });
  }
  
  const updateGroups = async () => {
    setGroups(await getGroups());
  }
  
  const updateAuthors = async () => {
    setGroups(await getGroups());
    // Get Authors
    getLattesData().then(async (authorList) => {
      setAuthors(authorList);
      setAuthorsNameLink(Object.entries(authorList).map(author =>( {link: author[0],name: author[1].name})));
    });
  }

  const routes = [
    {
      path: "/index",
      component: <Index authors={authors} allQualisScores={allQualisScores} groups={groups} authorsNameLink={authorsNameLink} prevArea={area}/>,
      layout: "/admin",
    },
    {
      path: "/cv-list",
      component: <CVList authorsNameLink={authorsNameLink} allQualisScores={allQualisScores} updateAuthors={updateAuthors}/>,
      layout: "/admin",
    },
    {
      path: "/group-list",
      component: <GroupList authors={authors} groups={groups} updateGroups={updateGroups} authorsNameLink={authorsNameLink} allQualisScores={allQualisScores}/>,
      layout: "/admin",
    },
    {
      path: "/questions",
      component: <Questions />,
      layout: "/admin",
    },
    {
      path: "/comments",
      component: <Comments />,
      layout: "/admin",
    },
    {
      path: "/other-infos",
      component: <OtherInfos />,
      layout: "/admin",
    },
    {
      path: "/credits",
      component: <Credits />,
      layout: "/admin",
    }
  ];

  useEffect(() => {
    getInfos()
  }, []);

  return (
    <>
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("./assets/img/qlattes-logo.png"),
          imgAlt: "Qlattes",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <Routes>
          {routes.map((prop, key) =>
            <Route path={prop.path} element={prop.component} key={key} exact />
          )}
          <Route path="*" element={<Navigate to="/admin/index" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default IndexLayout;
