import React, { useState } from "react";

const TodoForm = ({ createTodo }) => {
  const [todoText, setTodoText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    createTodo({title:todoText, completed:false});
    setTodoText("");
  };

  const onChange = (e) => setTodoText(e.target.value);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={onChange}
          value={todoText}
          placeholder="Add a new item"
        />
        <button>Submit</button>
      </form>
    </>
  );
};

export default TodoForm;
