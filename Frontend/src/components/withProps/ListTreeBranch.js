import React, { useState } from 'react'
import ListTreeNode from './ListTreeNode'

export default function ListTreeBranch(props) {
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
          return <ListTreeNode key={item._id} item={item} lastOrder={listItems.length - 1} stateLists={stateLists} stateItems={stateItems} editTree={editTree} />
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