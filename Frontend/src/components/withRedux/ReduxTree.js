import React, { useEffect } from 'react'
import { Provider, connect } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { apiClient } from '../../request'
import ReduxTreeBranch from './ReduxTreeBranch'

const initialState = {
  lists: null,
  items: null
}

const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'set-lists':
      return {
        ...state,
        lists: action.lists
      }
    case 'set-items':
      return {
        ...state,
        items: action.items
      }
    case 'add-item':
      return {
        ...state,
        items: state.items.concat(action.newItem)
      }
    case 'add-sub':
      return {
        ...state,
        lists: state.lists.concat(action.newSub)
      }
    case "del-sub":
      return {
        ...state,
        lists: state.lists.filter(itm => (!itm.ancestors.includes(action.parent) || itm.parent !== action.parent)),
        items: state.items.filter(itm => !itm.ancestors.includes(action.parent)),
      }
    case "del-item":
      let delItem = state.items.find(itm => itm._id === action.parent)
      let chItems = state.items
        .filter(itm => (!itm.ancestors.includes(action.parent) && itm._id !== action.parent))
        .map(itm => {
          if (itm.parent === delItem.parent && itm.order > delItem.order) itm.order -= 1;
          return itm;
        })
      return {
        ...state,
        lists: state.lists.filter(itm => (!itm.ancestors.includes(action.parent) || itm.parent !== action.parent)),
        items: chItems
      }
    case "move-up":
      return {
        ...state,
        items: state.items.map(itm => {
          if (itm._id === action.result[0]._id) itm.order = action.result[0].order;
          if (itm._id === action.result[1]._id) itm.order = action.result[1].order;
          return itm;
        })
      }
    case "move-down":
      return {
        ...state,
        items: state.items.map(itm => {
          if (itm._id === action.result[0]._id) itm.order = action.result[0].order;
          if (itm._id === action.result[1]._id) itm.order = action.result[1].order;
          return itm;
        })
      }
    default:
      return state;
  };
}

const store = createStore(mainReducer, applyMiddleware(thunk));

const getLists = () => async dispatch => {
  let lists = await apiClient.getLists()
  dispatch({ type: 'set-lists', lists })
}

const getItems = () => async dispatch => {
  let items = await apiClient.getItems();
  dispatch({ type: 'set-items', items });
}

const mapStateToProps = state => {
  return state;
};

const mapDispatchToProps = {
  getLists,
  getItems
};

const Main = connect(
  mapStateToProps,
  mapDispatchToProps
)(function (props) {

  const { lists, items, getLists, getItems } = props;

  useEffect(() => {
    getLists();
    getItems();
  }, [getLists, getItems])

  if (lists && items) {
    return (
      <div className={`tree-wrapper${props.active ? '' : ' hidden'}`}>
        <div className="tree-title">Redux List</div>
        <ReduxTreeBranch listId={lists[0]._id} />
      </div>
    );
  } else {
    return (
      <div className={`tree-wrapper${props.active ? '' : ' hidden'}`}>Loading...</div>
    )
  }
})

export default function ReduxTree(props) {

  return (
    <Provider store={store}>
      <Main active={props.active} />
    </Provider>
  )
}
