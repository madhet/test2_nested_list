import React from 'react'
import ListTreeBranch from './ListTreeBranch'

export default function TreeNode(props) {

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
        <ListTreeBranch listId={subList[0]._id} stateLists={stateLists} stateItems={stateItems} editTree={editTree} />
      ) : ""}
    </li>
  )
}
