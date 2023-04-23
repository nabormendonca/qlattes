/*global chrome*/

import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import { Routes , Route } from "react-router-dom";
import Instructions from './pages/Instructions';
import Questions from './pages/Questions';
import Analysis from './pages/Analysis';
import Comments from './pages/Comments';
import Credits from './pages/Credits';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataInformation from './pages/DataInformation';
import FutureEnhancements from './pages/FutureEnhancements';
import About from './pages/About';
import { fetchJSON, updateLattesData } from './Utils/utils';
import { useEffect, useState } from 'react';

function App() {
  const [allQualisScores, setAllQualisScores] = useState([]);
  const [area, setArea] = useState("");

  async function getInfos() {
    // update area data (if previously saved in local store)
    setAllQualisScores(await fetchJSON(chrome.runtime.getURL('data/qualis-scores-by-area-2017-2020.json')));
    const data = await chrome.storage.local.get(['area_data']);
    if (Object.keys(data).length > 0 && data?.area_data?.area) {
      setArea(data.area_data.area);
    }
    
  }

  useEffect(() => {
    getInfos();
    
  });
  
  return (
    <div className="body">
      <Header/>
      <Routes>
        <Route exact path="/index.html" element={<Analysis allQualisScores={allQualisScores} area={area}/>}/>
        <Route exact path="/index.html/instructions"  element={<Instructions/>}/>
        <Route exact path="/index.html/about"  element={<About/>} />
        <Route exact path="/index.html/comments" element={<Comments/>}/>
        <Route exact path="/index.html/credits" element={<Credits/>}/>
        <Route exact path="/index.html/data-information" element={<DataInformation/>}/>
        <Route exact path="/index.html/future-enhancement" element={<FutureEnhancements/>}/>
        <Route exact path="/index.html/privacy-policy" element={<PrivacyPolicy/>}/>
        <Route exact path="/index.html/questions" element={<Questions/>}/>
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
