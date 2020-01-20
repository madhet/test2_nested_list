import React from 'react';
import './main.css'
import ListTree from './components/withProps/ListTree'
import ReducerTree from './components/withUseReducer/ReducerTree'
import ReduxTree from './components/withRedux/ReduxTree'

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