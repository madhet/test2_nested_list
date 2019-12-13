import React from 'react'
import { connect } from "react-redux";
import { apiClient } from '../request'
import ReduxTreeBranch from './ReduxTreeBranch'

const addSublist = parent => async dispatch => {
  let newSub = await apiClient.addList({ parent })
  dispatch({ type: 'add-sub', newSub })
}

const delSublist = parent => dispatch => {
  apiClient.delList(parent)
    .then(() => {
      dispatch({ type: 'del-sub', parent })
    });
}

const delItem = parent => dispatch => {
  apiClient.delItem(parent)
    .then(() => {
      dispatch({ type: 'del-item', parent })
    });
}

const upItem = (first, second) => async dispatch => {
  const firstUp = await apiClient.editItem(first._id, { order: first.order - 1 })
  const secondUp = await apiClient.editItem(second._id, { order: second.order + 1 })
  const resultUp = await Promise.all([firstUp, secondUp]);
  dispatch({ type: 'move-up', result: resultUp })
}

const downItem = (first, second) => async dispatch => {
  const firstDown = await apiClient.editItem(first._id, { order: first.order + 1 })
  const secondDown = await apiClient.editItem(second._id, { order: second.order - 1 })
  const resultDown = await Promise.all([firstDown, secondDown]);
  dispatch({ type: 'move-down', result: resultDown })
}

const ReduxTreeNode = props => {

  const { item, subList, movedItems, itemPos, addSublist, delSublist, delItem, upItem, downItem } = props;

  function itemMoveUp() {
    upItem(movedItems[itemPos], movedItems[itemPos - 1]);
  }

  function itemMoveDown() {
    downItem(movedItems[itemPos], movedItems[itemPos + 1]);
  }

  return (
    <li>
      {item.title}
      {item.order ? (
        <button onClick={itemMoveUp}>&uarr;</button>
      ) : ""}
      {item.order < movedItems.length - 1 ? (
        <button onClick={itemMoveDown}>&darr;</button>
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
        <ReduxTreeBranch listId={subList[0]._id} />
      ) : ""}
    </li>
  )
}

const mapStateToProps = (state, props) => {
  // check if current item has a sublist
  const subList = state.lists.filter(list => list.parent === props.item._id);
  // find all siblings for current item
  const movedItems = state.items.filter(itm => itm.parent === props.item.parent).sort((a, b) => a.order - b.order);
  // find position of current item
  const itemPos = movedItems.findIndex(itm => itm._id === props.item._id);
  return {
    subList,
    movedItems,
    itemPos,
  };
};

const mapDispatchToProps = {
  addSublist,
  delSublist,
  delItem,
  upItem,
  downItem
};

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTreeNode)
