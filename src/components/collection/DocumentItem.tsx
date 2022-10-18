import { FC } from 'react'
import { IPdfDocument } from '~/typings/data'
import Icon from '../base/Icon'
import MenuItem from '../base/menu/MenuItem'

interface DocumentItemProps {
  document: IPdfDocument
  onClick: () => void
}
const DocumentItem: FC<DocumentItemProps> = ({ document, onClick }) => {
  return (
    <MenuItem id={document?.id} onClick={onClick} icon={<Icon name="park-file-pdf-one" />} type="button">
      {document?.name || document?.metadata?.title}
    </MenuItem>
  )
}

export default DocumentItem
