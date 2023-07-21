import {
  Container,
  Row,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "reactstrap";
import GroupItem from "components/GroupItem";
import { useState } from "react";

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import {
  addNewGroup,
} from "../utils";

const GroupList = ({
  authors,
  groups,
  updateGroups,
  authorsNameLink,
  allQualisScores
}) => {
  if (!groups) groups = [];

  const [modal, setModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAuthors, setNewGroupAuthors] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggle = () => setModal(!modal);

  const handleNewButton = async () => {
    await addNewGroup(newGroupName, newGroupAuthors);
    toggle();
    setNewGroupAuthors([]);
    setNewGroupName("");
    updateGroups();
  };

  const handleNewGroupAuthors = (event, values) => {
    setNewGroupAuthors(values.map(value => value.link));
  }

  const handleCancelButton = () => {
    setNewGroupAuthors([]);
    setNewGroupName("");
    toggle();
  }

  const searchGroupOrAuthor = (event, value) => {
    setSelectedOption(value);
  }

  return (
    <>
      <Container fluid className="mt-3 mb-3" expand="md">
        <Form className="navbar-search navbar-search-dark form-inline mr-3 d-md-flex">
          <FormGroup className="w-100" style={{ justifyContent: 'space-between' }}>
            <InputGroup className="input-group-alternative" style={{ width:"400px", border: 'none', backgroundColor: 'white' }}>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="fas fa-search" style={{ color: '#415e98' }}/>
                </InputGroupText>
              </InputGroupAddon>
              <Autocomplete
                onChange={searchGroupOrAuthor}
                options={authorsNameLink.concat(Object.values(groups))}
                getOptionLabel={(option) => option.name}
                filterSelectedOptions
                noOptionsText="Não há CVs ou grupos disponíveis"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Pesquise por um CV ou grupo"
                  />
                )}
                sx={{
                  width: '80%',
                  '& .MuiButtonBase-root': {
                      display: 'none',
                      color: '#415e98',
                  },
                  '& .MuiInputBase-input': {
                      color: '#415e98',
                  },
                  '& fieldset': {
                    border: "none",
                  }
                }}
              />
            </InputGroup>
            <Button
              color="white"
              onClick={toggle}
              size="sm"
              style={{
                width: '160px',
                alignSelf: 'flex-start',
                color: '#415e98'
              }}
            >
              Criar novo grupo
            </Button>
          </FormGroup>
        </Form>
      </Container>
      {/* Page content */}
      <Container className="mb-5" fluid>
        <Row>
          <div className="col">
            {Object.entries(groups).map(group => {
              // If the selected item on search is a group (has an authors item), check if this group has the name selected
              if (selectedOption?.authors && group[1].name !== selectedOption.name) return;

              let groupAuthors = group[1].authors.map(authorLink => ({link: authorLink, name: authors[authorLink].name}));

              // If the selected item on search is a author (has a link item), check if this group has the author selected
              if (selectedOption?.link) {
                groupAuthors = groupAuthors.filter(item => item.link === selectedOption.link)
                if(groupAuthors.length === 0) return;
              }

              return <GroupItem
                key={group[0]}
                groupId={group[0]}
                groupName={group[1].name}
                allAuthors={Object.entries(authors).filter(author => !group[1].authors.includes(author[0])).map(author => ({link: author[0], name: author[1].name}))}
                authors={groupAuthors}
                updateGroups={updateGroups}
                allQualisScores={allQualisScores}
              />
            })}
          </div>
        </Row>
      </Container>

      {/* New group Modal */}
      <Modal isOpen={modal}>
        <ModalHeader>Adicionar um novo Grupo</ModalHeader>
        <ModalBody>
          <Input placeholder="Nome do grupo" type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}/>
          <Autocomplete
            onChange={handleNewGroupAuthors}
            multiple
            options={Object.entries(authors).map(author => ({link: author[0], name: author[1].name}))}
            getOptionLabel={(option) => option.name}
            defaultValue={[]}
            filterSelectedOptions
            noOptionsText="Não há CVs disponíveis"
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
          <Button color="primary" onClick={handleNewButton}>
            Salvar
          </Button>{' '}
          <Button color="secondary" onClick={handleCancelButton}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

    </>
  );
};

export default GroupList;
