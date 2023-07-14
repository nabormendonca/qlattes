import React, { useState } from 'react';
import {
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Navbar,
} from "reactstrap";
import CVItem from "components/CVItem";

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
const CVList = ({
  authorsNameLink,
  allQualisScores,
  updateAuthors
}) => {
  const [filteredAuthors, setFilteredAuthors] = useState(authorsNameLink);
  const searchAuthor = (event, values) => {
    if (!values)
      setFilteredAuthors(authorsNameLink);
    else
      setFilteredAuthors([values]);
  }

  const updateCurrAuthors = (authorLink) => {
    setFilteredAuthors(filteredAuthors.filter(author => author.link !== authorLink));
    updateAuthors();
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
                onChange={searchAuthor}
                options={authorsNameLink}
                getOptionLabel={(option) => option.name}
                filterSelectedOptions
                noOptionsText="Não há CVs disponíveis"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Pesquise por um CV"
                  />
                )}
                sx={{
                  width: '80%',
                  '& .MuiButtonBase-root': {
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
          </FormGroup>
        </Form>
      </Container>
      {/* Page content */}
      <Container className="mb-5" fluid>
        <Row>
          <div className="col">
            <Card className="shadow mt-3">
              <CardHeader className="bg-transparent">
                <h3 className="mb-0">Currículos Carregados</h3>
              </CardHeader>
              <CardBody>
                <Row className="icon-examples">
                  {filteredAuthors.map(author => <CVItem authorName={author.name} CVLink={author.link} key={author.link} allQualisScores={allQualisScores} updateAuthors={updateCurrAuthors}/>)}
                </Row>
              </CardBody>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default CVList;
