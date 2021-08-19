import "axios";
import axios from "axios";
import React, { useEffect, useState } from "react";

import TodoList from "./TodoList";
import TodoForm from "./TodoForm";

const Todos = () => {
  const [todos, setTodos] = useState([]);

  const BASE_URL = "http://localhost:8000/todos";
  const headers = {
    "content-type": "application/json",
  };

  const getTodos = () => {
    (async () => {
      await axios
        .get(BASE_URL)
        .then((res) => {
          setTodos(res.data.todos);
        })
        .catch((err) => console.error(JSON.stringify(err.response)));
    })();
  };

  const createTodo = (formData) => {
    (async () => {
      await axios.post(BASE_URL + `/`, { formData }, { headers })
        .then(res=>getTodos())
        .catch(err=>console.error(err.response));
    })();
  };

  const toggleComplete = (todo) => {
    (async () => {
      const formData = {
        ...todo,
        completed: !todo.completed,
      };
      await axios
        .post(BASE_URL + `/${todo.id}/`, formData, { headers })
        .then((res) => getTodos())
        .catch((err) => console.error(err.response));
    })();
  };

  const deleteTodo = (todo) => {
    (async () => {
      await axios
        .post(BASE_URL + `/delete/${todo.id}/`, {}, { headers })
        .then((res) => getTodos())
        .catch((err) => console.error(err.response));
    })();
  };

  // Get all Todos on app load
  useEffect(() => {
    getTodos();
  }, [setTodos]);

  return (
    <div>
      <TodoForm createTodo={createTodo} />
      <TodoList
        todos={todos}
        toggleComplete={toggleComplete}
        deleteTodo={deleteTodo}
      />
    </div>
  );
};

export default Todos;
