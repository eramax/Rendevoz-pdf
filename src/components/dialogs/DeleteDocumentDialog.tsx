import { Noop } from '@/common/types'
import { Content, Footer } from '../base'

const DeleteDocumentDialog = ({ onBack, onSubmit }: { onBack: Noop; onSubmit: Noop }) => {
  return (
    <Content flex column alignItems="center" style={{ padding: '12px 28px' }}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>Delete file</div>
      <div style={{ fontSize: 14, marginTop: 16, marginBottom: 8 }}>Are you sure you want to delete this file?</div>
      <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', marginBottom: 24 }}>You can recover it from bin later</div>
      <Content style={{ width: '100%' }}>
        <Footer onBack={onBack} onSubmit={onSubmit} submitText="Confirm" backText="Cancel"></Footer>
      </Content>
    </Content>
  )
}

export default DeleteDocumentDialog
