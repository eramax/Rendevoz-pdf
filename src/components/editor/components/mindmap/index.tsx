import { DragEventHandler, FC } from 'react'
import ReactFlow, { Node, Edge, OnNodesChange, OnEdgesChange, ReactFlowProps } from 'react-flow-renderer'

type FlowProps = ReactFlowProps

const ThoughtFlow: FC<FlowProps> = ({ ...rest }) => {
  return <ReactFlow {...rest}></ReactFlow>
}

export default ThoughtFlow
