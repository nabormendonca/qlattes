// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  Row,
} from "reactstrap";
// core components
import CVItem from "./CVItem";
import {
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
  exportGroupCV,
  deleteGroup,
  addCVinGroup
} from "../utils";

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const GroupItem = ({
  groupId,
  groupName,
  allAuthors,
  authors,
  updateGroups,
  allQualisScores
}) => {
  const [modal, setModal] = useState(false);
  const [modalAreaSelect, setModalAreaSelect] = useState(false);
  const [area, setArea] = useState();
  const [areaData, setAreaData] = useState({});

  const toggle = () => setModal(!modal);
  const toggleModalAreaSelect = () => setModalAreaSelect(!modalAreaSelect);

  const handleSaveButton = async () => {
    await addCVinGroup(groupId, selectedAuthors);
    toggle();
    updateGroups();
  }

  const handleCancelButton = () => {
    setSelectedAuthors([]);
    toggle();
  }

  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const handleAddCVs = (event, values) => {
    setSelectedAuthors(values.map(value => value.link));
  }

  // Group functions
  const handleGroupExport = () => {
    exportGroupCV(authors.map(author => author.link), areaData);
  }

  const handleGroupDelete = async () => {
    await deleteGroup(groupId);
    updateGroups();
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
    <Card className="shadow mt-3">
      <CardHeader className="bg-transparent" style={{ flexDirection: 'row', display: 'flex', justifyContent: "space-between" }}>
        <h3 className="mb-0">{groupName}</h3>
        <div>
          <i className="fas fa-file-export mr-2" onClick={toggleModalAreaSelect} style={{fontSize: "14px", cursor: "pointer"}} title="Exportar dados dos CVs do grupo"/>
          <i className="fas fa-trash-can mr-2" onClick={handleGroupDelete} style={{fontSize: "14px", cursor: "pointer"}} title="Deletar grupo"/>
          <i className="fas fa-plus" style={{cursor: "pointer"}} onClick={toggle} title="Adicionar um CV ao grupo"/>
        </div>
      </CardHeader>
      <CardBody>
        <Row className="icon-examples">
          {authors.map(author => <CVItem authorName={author.name} CVLink={author.link} key={author.link} group={groupId} groupName={groupName} updateGroups={updateGroups} allQualisScores={allQualisScores}/>)}
        </Row>
      </CardBody>
      {/* Modal to add authors */}
      <Modal isOpen={modal}>
        <ModalHeader>Adicionar um novo CV ao {groupName}</ModalHeader>
        <ModalBody>
          <Autocomplete
            onChange={handleAddCVs}
            multiple
            options={allAuthors}
            getOptionLabel={(option) => option.name}
            defaultValue={[]}
            filterSelectedOptions
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Selecione um CV"
              />
            )}
            sx={{
              width: '90%',
              '& .MuiButtonBase-root': {
                color: '#415e98',
              },
              '& .MuiInputBase-input': {
                color: '#415e98',
              },
              '& fieldset': {
                border: "none",
              },
              '& .MuiInputBase-root > .MuiButtonBase-root': {
                border: '1px #415e98 solid',
                backgroundColor: 'transparent',
                '& .MuiSvgIcon-root': {
                  color: "#415e98"
                }
              }
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSaveButton}>
            Salvar
          </Button>{' '}
          <Button color="secondary" onClick={handleCancelButton}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
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
          <Button color="primary" onClick={() => {handleGroupExport();toggleModalAreaSelect();}}>
            Continuar
          </Button>{' '}
          <Button color="secondary" onClick={toggleModalAreaSelect}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

export default GroupItem;