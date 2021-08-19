import React from "react";

const TodoList = ({ todos, toggleComplete, deleteTodo }) => {
  return (
    <div>
      {todos &&
        todos.map((todo) => (
          <div key={todo.id}>
            <h2>{todo.title}</h2>
            <p>Completed: {todo.completed.toString()}</p>
            <div>
              <button onClick={() => toggleComplete(todo)}>
                {!todo.completed ? "Complete" : "Undo Complete"}
              </button>
              <button onClick={() => deleteTodo(todo)}>Delete</button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default TodoList;
