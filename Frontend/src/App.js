import React from 'react';
import './main.css'
import ListTree from './components/ListTree'
import ReducerTree from './components/ReducerTree'
import ReduxTree from './components/ReduxTree'

function App() {

  return (
    <div className="App">
      <ListTree active={false} />
      <ReducerTree active={false} />
      <ReduxTree active={true} />
    </div>
  );
}

export default App;