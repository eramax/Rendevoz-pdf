import { Descendant } from 'slate'
import { CustomElement } from '../../customTypes'
const headingType = ['heading-one', 'heading-two', 'heading-three', 'heading-four', 'heading-five']

export interface HeadingTreeNode{
  id: number
  text?: string
  children: HeadingTreeNode[]
  level: number
  isOpen?: boolean
}
export interface HeadingListNode extends HeadingTreeNode{
  rowIndex?: number
}
interface IOutliner{
  headingListToTree: (list: Descendant[]) => HeadingTreeNode
  flattenHeadingTree: (root: HeadingTreeNode) => HeadingListNode[]
  searchTree: (tree: HeadingTreeNode, value: any, key: string, reverse: boolean) => HeadingTreeNode | null
}
const Outliner: IOutliner = {
  headingListToTree: (list: Descendant[]): HeadingTreeNode => {
    const headingList = list.filter(i => { i = i as CustomElement; return headingType.includes(i.type) && i.children[0]?.text !== '' })
    const newList = headingList.map(i => {
      switch (i.type) {
        case 'heading-one':
          return {
            level: 1,
            id: i.id,
            text: i.children[0].text
          }
        case 'heading-two':
          return {
            level: 2,
            id: i.id,
            text: i.children[0].text
          }
        case 'heading-three':
          return {
            level: 3,
            id: i.id,
            text: i.children[0].text
          }
        case 'heading-four':
          return {
            level: 4,
            id: i.id,
            text: i.children[0].text
          }
        case 'heading-five':
          return {
            level: 5,
            id: i.id,
            text: i.children[0].text
          }
        case 'heading-six':
          return {
            level: 6,
            id: i.id,
            text: i.children[0].text
          }
      }
    })
    const stack = [{ level: 0, children: [], isOpen: true }]
    newList.forEach(h => {
      const self = {
        text: h?.text,
        id: h.id,
        children: [],
        level: h?.level,
        isOpen: true
      }
      while (self.level <= stack[stack.length - 1].level) stack.pop()
      stack[stack.length - 1].children.push(self)
      stack.push(self)
    })
    return stack[0]
  },
  flattenHeadingTree: (root: HeadingTreeNode) => {
    const list: HeadingListNode[] = []
    let index = 0
    function collect (node: HeadingTreeNode) {
      const listNode: HeadingListNode = { ...node }
      if (listNode.level >= 0) {
        listNode.rowIndex = index++
        list.push(listNode)
      }
      if (listNode.isOpen) {
        listNode.children?.forEach(collect)
      }
    }
    collect(root)
    return list
  },
  searchTree: (tree: HeadingTreeNode, value, key = 'id', reverse = false) => {
    const stack = [tree.children[0]]
    while (stack.length) {
      const node = stack[reverse ? 'pop' : 'shift']()
      if (node[key] === value) return node
      node?.children && stack.push(...node.children)
    }
    return null
  }
}
export default Outliner
