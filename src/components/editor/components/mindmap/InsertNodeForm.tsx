import { Noop } from '@/common/types'
import Form from '@/components/base/form'
import { FC, useState } from 'react'

const InsertNodeForm: FC<{
  onBack: Noop
  onSubmit: (node: { id: number; type: 'common'; content: string; backgroundColor: string }) => void
}> = ({ onBack, onSubmit }) => {
  const [node, setNode] = useState({
    id: 123,
    type: 'common',
    backgroundColor: 'white',
    content: ''
  })
  return (
    <Form
      title="Customize mindmap node"
      onBack={onBack}
      onSubmit={() => {
        onSubmit(node)
      }}
    >
      <Form.Item text="Node content" type="input" onChange={value => setNode({ ...node, content: value })}></Form.Item>
      <Form.Item text="Background Color" type="colorPicker" onChange={color => setNode({ ...node, backgroundColor: color })} />
    </Form>
  )
}

export default InsertNodeForm
