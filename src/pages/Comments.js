import '../App.css';

function Comments() {
  return (
    <div class="content-form">
      <h1>Comentários e Sugestões</h1>
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLScWkosurzk1ukkTV28Yv9dGzIcw4jlmY6zWfCf9CjbEHU3Fig/viewform?embedded=true"
        width="100%"
        height="70vh"
        frameborder="none"
        marginheight="0"
        marginwidth="0"
        style={{ flexGrow: 1 }}
      >
        Carregando…
      </iframe>
    </div>
  );
}

export default Comments;
