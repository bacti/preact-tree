import { h, Component } from 'preact'
import PropTypes from 'prop-types'
import Tree from './tree'
import Node from './node'

export default class UITree extends Component
{
    componentWillMount()
    {
        this.setState(
        {
            dragging:
            {
                id: null,
                x: null,
                y: null,
                w: null,
                h: null,
            }
        })
    }

    Init()
    {
        const { tree, isNodeCollapsed, renderNode, changeNodeCollapsed } = this.props
        this.tree = new Tree(tree)
        this.tree.isNodeCollapsed = isNodeCollapsed
        this.tree.renderNode = renderNode
        this.tree.changeNodeCollapsed = changeNodeCollapsed
        this.tree.UpdateNodesPosition()
        this.props.dirty = true
    }

    GetDraggingDom()
    {
        const { dragging } = this.state
        if (dragging && dragging.id)
        {
            const { paddingLeft, collapsible } = this.props
            const draggingIndex = this.tree.getIndex(dragging.id)
            const draggingStyles =
            {
                top: dragging.y,
                left: dragging.x,
                width: dragging.w,
            }

            return (
                <div className='m-draggable' style={draggingStyles}>
                    <Node
                        tree={this.tree}
                        index={draggingIndex}
                        paddingLeft={paddingLeft}
                        collapsible={collapsible}
                    />
                </div>
            )
        }
        return null
    }

    render({ dirty, paddingLeft, collapsible }, { tree, dragging })
    {
        !dirty && this.Init()
        return (
            <div className='m-tree'>
                { this.GetDraggingDom() }
                <Node
                    tree={this.tree}
                    index={this.tree.getIndex(1)}
                    key={1}
                    paddingLeft={paddingLeft}
                    collapsible={collapsible}
                    onDragStart={this.dragStart}
                    onCollapse={this.toggleCollapse}
                    dragging={dragging && dragging.id}
                />
            </div>
        )
    }

    dragStart = (id, dom, e) =>
    {
        if (e.button !== 0)
            return
        this.dragging =
        {
            id: id,
            w: dom.offsetWidth,
            h: dom.offsetHeight,
            x: dom.offsetLeft,
            y: dom.offsetTop
        }

        this._startX = dom.offsetLeft
        this._startY = dom.offsetTop
        this._offsetX = e.clientX
        this._offsetY = e.clientY
        this._start = true

        window.addEventListener('mousemove', this.drag)
        window.addEventListener('mouseup', this.dragEnd)
    }

    drag = e =>
    {
        if (this._start)
        {
            this.setState({ dragging: this.dragging })
            this._start = false
        }

        const tree = this.tree
        const dragging = this.state.dragging
        const paddingLeft = this.props.paddingLeft
        let newIndex = null
        let index = tree.getIndex(dragging.id)
        const collapsed = index.node.collapsed

        const _startX = this._startX
        const _startY = this._startY
        const _offsetX = this._offsetX
        const _offsetY = this._offsetY

        const pos =
        {
            x: _startX + e.clientX - _offsetX,
            y: _startY + e.clientY - _offsetY,
        }
        dragging.x = pos.x
        dragging.y = pos.y

        const diffX = dragging.x - paddingLeft / 2 - (index.left - 2) * paddingLeft
        const diffY = dragging.y - dragging.h / 2 - (index.top - 2) * dragging.h

        if (diffX < 0)
        {
            // left
            if (index.parent && !index.next)
            {
                newIndex = tree.Move(index.id, index.parent, 'after')
            }
        }
        else
        if (diffX > paddingLeft)
        {
            // right
            if (index.prev)
            {
                const prevNode = tree.getIndex(index.prev).node
                if (!prevNode.collapsed && !prevNode.leaf)
                {
                    newIndex = tree.Move(index.id, index.prev, 'append')
                }
            }
        }

        if (newIndex)
        {
            index = newIndex
            newIndex.node.collapsed = collapsed
            dragging.id = newIndex.id
        }

        if (diffY < 0)
        {
            // up
            const above = tree.GetNodeByTop(index.top - 1)
            if (above == undefined)
                return
            newIndex = tree.Move(index.id, above.id, 'before')
        }
        else
        if (diffY > dragging.h)
        {
            // down
            if (index.next)
            {
                const below = tree.getIndex(index.next)
                if (below.children && below.children.length && !below.node.collapsed)
                {
                    newIndex = tree.Move(index.id, index.next, 'prepend')
                }
                else
                {
                    newIndex = tree.Move(index.id, index.next, 'after')
                }
            }
            else
            {
                const below = tree.GetNodeByTop(index.top + index.height)
                if (below && below.parent !== index.id)
                {
                    if (below.children && below.children.length && !below.node.collapsed)
                    {
                        newIndex = tree.Move(index.id, below.id, 'prepend')
                    }
                    else
                    {
                        newIndex = tree.Move(index.id, below.id, 'after')
                    }
                }
            }
        }

        if (newIndex)
        {
            newIndex.node.collapsed = collapsed
            dragging.id = newIndex.id
        }
        this.setState({ dragging: dragging })
    }

    dragEnd = _ =>
    {
        this.setState(
        {
            dragging:
            {
                id: null,
                x: null,
                y: null,
                w: null,
                h: null,
            }
        })

        this.change(this.tree)
        window.removeEventListener('mousemove', this.drag)
        window.removeEventListener('mouseup', this.dragEnd)
    }

    change(tree)
    {
        this.props.onChange && this.props.onChange(tree.obj)
    }

    toggleCollapse = nodeId =>
    {
        const tree = this.tree
        const index = tree.getIndex(nodeId)
        const node = index.node
        node.collapsed = !node.collapsed
        tree.UpdateNodesPosition()

        this.setState({ updated: true })
        this.change(tree)
    }
}
