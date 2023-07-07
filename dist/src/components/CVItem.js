import {
  Col,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import { useState } from "react";

import {
  removerCVfromDB,
  removeCVfromGroup,
  exportCV
} from "../utils";

const CVItem = ({
  authorName,
  CVLink,
  group,
  groupName,
  updateGroups,
  updateAuthors,
  allQualisScores
}) => {
  const [modalAreaSelect, setModalAreaSelect] = useState(false);
  const [area, setArea] = useState();
  const [areaData, setAreaData] = useState({});

  const toggleModalAreaSelect = () => setModalAreaSelect(!modalAreaSelect);

  const handleRemoveButton = async (e) => {
    let result;
    if (group) { // deletar de grupo
      result = window.confirm(
        `Confirma a remoção de ${authorName} do grupo ${groupName}?`
      );
      if (result) {
        await removeCVfromGroup(group, CVLink);
        updateGroups();
      } else {
        e.preventDefault();
      }
    } else { // deletar do banco
      result = window.confirm(
        `Confirma a remoção dos dados extraídos do CV de ${authorName}?\n\nUma vez confirmada, para visualizar os dados desde CV novamente, será necessário (re)abrir a página do CV no navegador.`
      );
  
      if (result) {
        await removerCVfromDB(CVLink);
        updateAuthors(CVLink);
      } else {
        e.preventDefault();
      }
    }
  }

  function handleLinkButton(e) {
    window.open(CVLink, '_blank');
  }

  function handleExportCV() {
    exportCV(CVLink, areaData);
  }

  function handleAreaChange(event) {
    // get previous area (if any)
    const prevArea = area;

    // get selected area
    const newArea = event.target.value;

    if (newArea !== "")  {
      // find selected area data in Qualis score data
      var match = allQualisScores.find((elem) =>
        Object.keys(elem.areas).includes(newArea)
      );

      if (match) {
        if (Object.keys(match.areas[newArea].scores).length > 0) {
          const currAreaData = {
            area: newArea,
            ...match.areas[newArea]
          }
          setAreaData(currAreaData);
          setArea(newArea);

          // save area data to local store
          // chrome.storage.local.set({ area_data: currAreaData});
        } else {
          // show no scores alert and reset area select to previous area (if any)
          alert('Esta Área do Conhecimento não definiu pontuação específica para os estratos do Qualis.');
          if (prevArea !== '') {
            // reset area select to previously selected option
            event.target.value = prevArea;
          } else {
            // reset area select to placeholder option
            event.target.selectedIndex = 0;
          }
        }
      }
    } else {
      setArea("");
      setAreaData({});
    }
  }

  return (
    <Col lg="3" md="6">
      <div className="btn-icon-clipboard" style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between' }}>
        <span>{authorName}</span>
        <div className="actions">
          <i className="fas fa-external-link-alt mr-1" onClick={handleLinkButton} style={{fontSize: "14px"}} title="Ir para link externo"/>
          {!group && <i className="fas fa-file-export mr-1" onClick={toggleModalAreaSelect} style={{fontSize: "14px"}} title="Exportar curriculo"/>}
          <i className={group ? "fas fa-close" : "fas fa-trash-can"} onClick={handleRemoveButton} style={{fontSize: "14px"}} title={group? "Remover curriculo do grupo" : "Remover curriculo do banco"}/>
        </div>
      </div>
      {/* Modal to select area */}
      <Modal isOpen={modalAreaSelect}>
        <ModalHeader>Deseja exportar os CVs do grupo {groupName} baseados em uma pontuação de alguma área do conhecimento?</ModalHeader>
        <ModalBody>
          <InputGroup className="input-group-alternative mt-3" style={{ marginRight: "15px", border: 'none', backgroundColor: 'white' }}>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="fas fa-graduation-cap" style={{ color: '#415e98' }}/>
              </InputGroupText>
            </InputGroupAddon>
            <Input
              id="exampleSelect"
              name="select"
              type="select"
              className="input-group-alternative"
              style={{ marginRight: "15px", color:'#415e98' }}
              value={area} onChange={e => handleAreaChange(e)}
              defaultValue=""
            >
              <option value="">Sem Área de Conhecimento</option>
              {allQualisScores.map(greatArea => <optgroup label={greatArea.label}  style={{color: "black"}}>
                {Object.keys(greatArea.areas).map(area => <option key={area} value={area}>{greatArea.areas[area].label}</option>)}
              </optgroup>)}
            </Input>
          </InputGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => {handleExportCV();toggleModalAreaSelect();}}>
            Continuar
          </Button>{' '}
          <Button color="secondary" onClick={toggleModalAreaSelect}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </Col>
  );
};

export default CVItem;
