import React, { useState, useEffect } from 'react'
import { request } from '../../request'
import ListTreeBranch from './ListTreeBranch'

export default function ListTree(props) {
  const [stateLists, setLists] = useState(null);

  useEffect(() => {
    request('/lists')
      .then(data => {
        setLists(data);
      })
  }, [])

  const [stateItems, setItems] = useState(null);
  useEffect(() => {
    request('/items')
      .then(data => {
        setItems(data);
      })
  }, [])

  async function editTree(action, parent, item) {
    switch (action) {
      case 'add-item':
        let newItem = await request('/items', 'POST', { parent, title: item })
        setItems(stateItems.concat(newItem));
        break;
      case 'add-sub':
        let newSub = await request('/lists', 'POST', { parent })
        setLists(stateLists.concat(newSub));
        break;
      case "del-sub":
        request(`/lists/${parent}`, 'DELETE')
          .then(() => {
            setItems(stateItems.filter(itm => !itm.ancestors.includes(parent)));
            setLists(stateLists.filter(itm => (!itm.ancestors.includes(parent) || itm.parent !== parent)));
          });
        break;
      case "del-item":
        request(`/items/${parent}`, 'DELETE')
          .then(() => {
            let delItem = stateItems.find(itm => itm._id === parent)
            let chItems = stateItems
              .filter(itm => (!itm.ancestors.includes(parent) && itm._id !== parent))
              .map(itm => {
                if (itm.parent === delItem.parent && itm.order > delItem.order) itm.order -= 1;
                return itm;
              })
            setLists(stateLists.filter(itm => !itm.ancestors.includes(parent)));
            setItems(chItems);
          });
        break;
      case "move-up":
        let movedUpSet = stateItems.filter(itm => itm.parent === parent).sort((a, b) => a.order - b.order);
        let movedUpPos = movedUpSet.findIndex(itm => itm._id === item);
        const firstUp = await request(`/items/${movedUpSet[movedUpPos]._id}`, 'PATCH', { order: movedUpSet[movedUpPos].order - 1 })
        const secondUp = await request(`/items/${movedUpSet[movedUpPos - 1]._id}`, 'PATCH', { order: movedUpSet[movedUpPos - 1].order + 1 })
        const resultUp = await Promise.all([firstUp, secondUp]);
        setItems(stateItems.map(itm => {
          if (itm._id === resultUp[0]._id) itm.order = resultUp[0].order;
          if (itm._id === resultUp[1]._id) itm.order = resultUp[1].order;
          return itm;
        }));
        break;
      case "move-down":
        let movedDownSet = stateItems.filter(itm => itm.parent === parent).sort((a, b) => a.order - b.order);
        let movedDownPos = movedDownSet.findIndex(itm => itm._id === item);
        const firstDown = await request(`/items/${movedDownSet[movedDownPos]._id}`, 'PATCH', { order: movedDownSet[movedDownPos].order + 1 })
        const secondDown = await request(`/items/${movedDownSet[movedDownPos + 1]._id}`, 'PATCH', { order: movedDownSet[movedDownPos + 1].order - 1 })
        const resultDown = await Promise.all([firstDown, secondDown]);
        setItems(stateItems.map(itm => {
          if (itm._id === resultDown[0]._id) itm.order = resultDown[0].order;
          if (itm._id === resultDown[1]._id) itm.order = resultDown[1].order;
          return itm;
        }));
        break;
      default:
    }
  }

  if (stateLists && stateItems) {
    return (
      <div className={`tree-wrapper${props.active ? '' : ' hidden'}`}>
        <div className="tree-title">Nested List</div>
        <ListTreeBranch active={props.active} listId={stateLists[0]._id} stateLists={stateLists} stateItems={stateItems} editTree={editTree} />
      </div>
    );
  } else {
    return (
      <div className={`tree-wrapper${props.active ? '' : 'hidden'}`}>Loading...</div>
    )
  }
}
