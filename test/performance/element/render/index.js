'use strict'
var renderElement = require('./element')

module.exports = function (type, stamp, subs, tree, ptree, rtree) {
  const target = subs._
  if (!target._base_version) {
    for (let uid in target) {
      render(target[uid], this, type, stamp, subs, tree, ptree, rtree)
    }
  } else {
    render(target, this, type, stamp, subs, tree, ptree, rtree)
  }
}

function render (target, state, type, stamp, subs, tree, ptree, rtree) {
  const uid = target.uid()
  var domNode
  if (type === 'remove') {
    console.error('REMOVE --- this has to be limited!', target.path())
    // only the top -- target nothing more
    domNode = tree._ && tree._[uid]
    if (target.type === 'element') {
      // need to do more need to go
      if (domNode) {
        if (target.__on.removeEmitter) {
          target.__on.removeEmitter.emit(target, stamp, domNode)
        }
        tree._[uid].parentNode.removeChild(domNode)
        delete tree._[uid]
      }
    } else {
      // removal can be called on render or something just simple
      // also elements can be called /w render -- also easy
      console.error('PROP REMOVAL')
    }
  } else {
    // this needs to be called of course fo the top level stuff else it sux
    if (!tree._) { tree._ = {} }
    if (target.type === 'element') {
      if (!tree._[uid]) {
        domNode = createElement(uid, target, state, type, stamp, subs, tree, ptree, rtree)
      }
    } else {
      if (target.key === 'text') {
        let val = target.compute(state.compute())
        if (!tree._[uid]) {
          tree._[uid] = document.createTextNode(val)
          let pnode = getParentNode(uid, target, state, type, stamp, subs, tree, ptree, rtree)
          if (!pnode) {
            console.error('NO PNODE!', target.path(), target.parent.path())
          } else {
            pnode.appendChild(tree._[uid])
          }
        } else {
          tree._[uid].nodeValue = val
        }
      }
    }
    return domNode
  }
}

function findParent (tree, uid) {
  while (tree) {
    if (tree._ && tree._[uid]) {
      return tree._[uid]
    }
    tree = tree._parent
  }
}

function getParentNode (uid, target, state, type, stamp, subs, tree, ptree, rtree) {
  const parent = target.parent
  if (parent) {
    let parentUid = parent.uid()
    let pnode
    if (subs._[parentUid]) {
      pnode = tree._[parentUid]
      if (!pnode) {
        pnode = render(parent, state, type, stamp, subs, tree, ptree, rtree)
      }
    } else {
      pnode = findParent(ptree, parentUid)
    }
    return pnode
  }
}

function createElement (uid, target, state, type, stamp, subs, tree, ptree, rtree) {
  const domNode = tree._[uid] = renderElement(target)
  const pnode = getParentNode(uid, target, state, type, stamp, subs, tree, ptree, rtree)
  if (pnode) {
    pnode.appendChild(domNode)
  } else {
    console.warn('no pnode must be the app', target.path())
  }
  return domNode
}
