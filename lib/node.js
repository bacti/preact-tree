import cx from 'classnames'
import { h, Component } from 'preact'

export default class UITreeNode extends Component
{
    RenderCollapse()
    {
        const { index } = this.props;
        if (index.children && index.children.length)
        {
            const { collapsed } = index.node
            return (
                <span
                    className={cx('collapse', collapsed ? 'caret-right' : 'caret-down')}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={evt => this.HandleCollapse(evt)}
                />
            )
        }
        return null
    }

    RenderChildren()
    {
        const { index, tree, dragging } = this.props
        if (index.children && index.children.length)
        {
            const childrenStyles =
            {
                paddingLeft: this.props.paddingLeft
            }

            return (
                <div className='children' style={childrenStyles}>
                    {index.children.map(child =>
                    {
                        const childIndex = tree.getIndex(child)
                        return (
                            <UITreeNode
                                tree={tree}
                                index={childIndex}
                                key={childIndex.id}
                                dragging={dragging}
                                paddingLeft={this.props.paddingLeft}
                                onCollapse={this.props.onCollapse}
                                onDragStart={this.props.onDragStart}
                            />
                        )
                    })}
                </div>
            )
        }
        return null
    }

    render()
    {
        const { tree, index, dragging } = this.props
        const { node } = index
        const styles = {}

        return (
            <div className={cx('m-node', { placeholder: index.id === dragging })} style={styles}>
                <div
                    className='inner'
                    ref={element => (this.innerDom = element)}
                    onMouseDown={evt => this.HandleMouseDown(evt)}
                >
                    { this.RenderCollapse() }
                    { tree.renderNode(node) }
                </div>
                { node.collapsed ? null : this.RenderChildren() }
            </div>
        )
    }

    HandleCollapse(evt)
    {
        evt.stopPropagation()
        const nodeId = this.props.index.id

        if (this.props.onCollapse)
        {
            this.props.onCollapse(nodeId)
        }
    }

    HandleMouseDown(evt)
    {
        const nodeId = this.props.index.id
        const dom = this.innerDom

        if (this.props.onDragStart)
        {
            this.props.onDragStart(nodeId, dom, evt)
        }
    }
}
