import {useState, useEffect} from 'react'
import './App.css';

function App() {

  const [time, setTime] = useState('')

  const updateTime = () => {
    const time = new Date().toLocaleTimeString()
    setTime(time)
  }

  useEffect(()=>{
    updateTime()
    setInterval(()=>{
      updateTime()
    }, 1000)
  },[])

  return (
    <div className="App">
      <h1>React Served with Django</h1>

      <h1>{time}</h1>
    </div>
  );
}

export default App;
