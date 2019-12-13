import React, { useState } from 'react'
import { connect } from "react-redux";
import { apiClient } from '../request'
import ReduxTreeNode from './ReduxTreeNode'

const addItem = (parent, title) => async dispatch => {
  let newItem = await apiClient.addItem({ parent, title })
  dispatch({ type: 'add-item', newItem })
}

const ReduxTreeBranch = props => {

  const [itemTitle, setTitle] = useState('');

  const { listId, listItems, addItem } = props;

  function addListItem(parent) {
    if (itemTitle) {
      addItem(parent, itemTitle);
      setTitle("");
    }
  }

  return (
    < ul className="tree-sublist">
      {listItems.length ? (
        listItems.map(item => {
          return <ReduxTreeNode key={item._id} item={item} />
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

const mapStateToProps = (state, props) => {
  return {
    //find items, that belongs to current list and sort them
    listItems: state.items.filter(item => item.parent === props.listId).sort((a, b) => a.order - b.order)
  };
};

const mapDispatchToProps = {
  addItem
};

export default connect(mapStateToProps, mapDispatchToProps)(ReduxTreeBranch)
