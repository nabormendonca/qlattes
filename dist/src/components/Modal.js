import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from "reactstrap";

const DefaultModal = ({
  header,
  content,
  confirmLabel,
  cancelLabel,
  okLabel
}) => {

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <Modal isOpen={modal}>
      <ModalHeader>{header}</ModalHeader>
      <ModalBody>
        {content}
      </ModalBody>
      <ModalFooter>
        {ok
          ? <>
            <Button color="primary" onClick={toggle}>
              {okLabel}
            </Button>
          </>
          : <>
            <Button color="primary" onClick={() => { toggle();  }}>
              {confirmLabel}
            </Button>{' '}
            <Button color="secondary" onClick={toggle}>
              {cancelLabel}
            </Button>
          </>
        }
      </ModalFooter>
    </Modal>
  );
};

export default DefaultModal;
