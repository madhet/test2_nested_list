import React, { useState, useReducer, useEffect } from 'react'
import { apiClient } from '../request.js'

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

const ReducerTreeBranch = props => {
  const [itemTitle, setTitle] = useState('');

  const { listId, stateLists, stateItems, editTree } = props;

  //find items, that belongs to current list and sort them
  const listItems = stateItems.filter(item => item.parent === listId).sort((a, b) => a.order - b.order)

  function addListItem(parent) {
    if (itemTitle) {
      editTree("add-item", parent, itemTitle);
      setTitle("");
    }
  }

  return (
    < ul className="tree-sublist">
      {listItems.length ? (
        listItems.map(item => {
          return <ReducerTreeNode key={item._id} item={item} lastOrder={listItems.length - 1} stateLists={stateLists} stateItems={stateItems} editTree={editTree} />
        })
      ) : ""}
      <div className="tree-additem-wrapper">
        <input type='text' value={itemTitle} onChange={e => setTitle(e.target.value)}
          onKeyUp={e => {
            if (e.keyCode === 13) addListItem(listId);
          }}
        />
        <button onClick={() => addListItem(listId)}>Add item</button>
      </div>
    </ul >
  )
}

const ReducerTreeNode = props => {
  const { item, lastOrder, stateLists, stateItems, editTree } = props;

  // check if current item has a sublist
  let subList = stateLists.filter(list => list.parent === item._id);

  function addSublist(parent) {
    editTree("add-sub", parent);
  }

  function delSublist(parent) {
    editTree("del-sub", parent);
  }

  function delItem(parent) {
    editTree("del-item", parent);
  }

  function itemMoveUp(parent, item) {
    editTree("move-up", parent, item);
  }

  function itemMoveDown(parent, item) {
    editTree("move-down", parent, item);
  }

  return (
    <li>
      {item.title}
      {item.order ? (
        <button onClick={() => itemMoveUp(item.parent, item._id)}>&uarr;</button>
      ) : ""}
      {item.order < lastOrder ? (
        <button onClick={() => itemMoveDown(item.parent, item._id)}>&darr;</button>
      ) : ""}
      {subList.length ? (
        <button onClick={() => delSublist(item._id)}>- sublist</button>
      ) : (
          <button onClick={() => addSublist(item._id)}>+ sublist</button>
        )
      }
      {item.parent ? (
        <button onClick={() => delItem(item._id)}>Remove</button>
      ) : ""
      }
      {subList.length ? (
        <ReducerTreeBranch listId={subList[0]._id} stateLists={stateLists} stateItems={stateItems} editTree={editTree} />
      ) : ""}
    </li>
  )
}

export default function ReducerTree(props) {

  const [tree, dispatch] = useReducer(mainReducer, initialState)

  useEffect(() => {
    apiClient.getLists()
      .then(data => {
        dispatch({ type: 'set-lists', lists: data });
      })
  }, [])

  useEffect(() => {
    apiClient.getItems()
      .then(data => {
        dispatch({ type: 'set-items', items: data });
      })
  }, [])

  async function editTree(action, parent, item) {
    switch (action) {
      case 'add-item':
        let newItem = await apiClient.addItem({ parent, title: item })
        dispatch({ type: 'add-item', newItem })
        break;
      case 'add-sub':
        let newSub = await apiClient.addList({ parent })
        dispatch({ type: 'add-sub', newSub })
        break;
      case "del-sub":
        apiClient.delList(parent)
          .then(() => {
            dispatch({ type: 'del-sub', parent })
          });
        break;
      case "del-item":
        apiClient.delItem(parent)
          .then(() => {
            dispatch({ type: 'del-item', parent })
          });
        break;
      case "move-up":
        let movedUpSet = tree.items.filter(itm => itm.parent === parent).sort((a, b) => a.order - b.order);
        let movedUpPos = movedUpSet.findIndex(itm => itm._id === item);
        const firstUp = await apiClient.editItem(movedUpSet[movedUpPos]._id, { order: movedUpSet[movedUpPos].order - 1 })
        const secondUp = await apiClient.editItem(movedUpSet[movedUpPos - 1]._id, { order: movedUpSet[movedUpPos - 1].order + 1 })
        const resultUp = await Promise.all([firstUp, secondUp]);
        dispatch({ type: 'move-up', result: resultUp })
        break;
      case "move-down":
        let movedDownSet = tree.items.filter(itm => itm.parent === parent).sort((a, b) => a.order - b.order);
        let movedDownPos = movedDownSet.findIndex(itm => itm._id === item);
        const firstDown = await apiClient.editItem(movedDownSet[movedDownPos]._id, { order: movedDownSet[movedDownPos].order + 1 })
        const secondDown = await apiClient.editItem(movedDownSet[movedDownPos + 1]._id, { order: movedDownSet[movedDownPos + 1].order - 1 })
        const resultDown = await Promise.all([firstDown, secondDown]);
        dispatch({ type: 'move-down', result: resultDown })
        break;
      default:
    }
  }

  if (tree.lists && tree.items) {
    return (
      <div className={`tree-wrapper${props.active ? '' : ' hidden'}`}>
        <div className="tree-title">useReducer List</div>
        <ReducerTreeBranch listId={tree.lists[0]._id} stateLists={tree.lists} stateItems={tree.items} editTree={editTree} />
      </div>
    );
  } else {
    return (
      <div className={`tree-wrapper${props.active ? '' : ' hidden'}`}>Loading...</div>
    )
  }
}
