const Tree = require('js-tree')
export default class extends Tree
{
    UpdateNodesPosition()
    {
        var top = 1
        var left = 1
        var root = this.getIndex(1)
        var self = this

        root.top = top++
        root.left = left++

        if (root.children && root.children.length)
        {
            Walk(root.children, root, left, root.node.collapsed)
        }

        function Walk(children, parent, left, collapsed)
        {
            var height = 1
            children.forEach(id =>
            {
                var node = self.getIndex(id)
                if (collapsed)
                {
                    node.top = null
                    node.left = null
                }
                else
                {
                    node.top = top++
                    node.left = left
                }

                if (node.children && node.children.length)
                {
                    height += Walk(node.children, node, left + 1, collapsed || node.node.collapsed)
                }
                else
                {
                    node.height = 1
                    height += 1
                }
            })

            parent.node.collapsed ? (parent.height = 1) : (parent.height = height)
            return parent.height
        }
    }

    Move(fromId, toId, placement)
    {
        if (fromId === toId || toId === 1)
            return

        var obj = this.remove(fromId)
        var index = null

        if (placement === 'before') index = this.insertBefore(obj, toId)
        else if (placement === 'after') index = this.insertAfter(obj, toId)
        else if (placement === 'prepend') index = this.prepend(obj, toId)
        else if (placement === 'append') index = this.append(obj, toId)

        // todo: perf
        this.UpdateNodesPosition()
        return index
    }

    GetNodeByTop(top)
    {
        var indexes = this.indexes
        for (var id in indexes)
        {
            if (indexes.hasOwnProperty(id))
            {
                if (indexes[id].top === top)
                    return indexes[id]
            }
        }
    }
}
