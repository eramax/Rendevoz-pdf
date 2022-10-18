import { FC, useState } from 'react'
import { ICollection } from '~/typings/data'
import Menu from '../base/menu'
import NewCollectionForm from '../form/NewCollectionForm'
import { Content, Footer } from '../base'
import Icon from '../base/Icon'
import Collection from '../collection'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Noop } from '@/common/types'

interface ChooseCollectionDialogProps {
  onBack?: Noop
  onChoose?: (collection: ICollection) => void
}
const transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
}
const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }
  }
}

const ChooseCollectionDialog: FC<ChooseCollectionDialogProps> = ({ onChoose, onBack }) => {
  const [isAddCollection, setIsAddCollection] = useState(false)
  const [chosenCollection, setChosenCollection] = useState<ICollection>()
  const [selectedCollection, setSelectedCollection] = useState<ICollection>()
  return (
    <Menu
      style={{ height: '100%', minHeight: 'inherit' }}
      title="Collections"
      extra={
        <Content
          onClick={() => setIsAddCollection(!isAddCollection)}
          flex
          centered
          style={{ color: '#8590ae', cursor: 'pointer', fontWeight: 600 }}
        >
          {!isAddCollection && (
            <>
              <Icon size={16} style={{ marginRight: 6 }} name="park-folder-plus" />
              <span>New Collection</span>
            </>
          )}
        </Content>
      }
    >
      <AnimatePresence initial={false}>
        {isAddCollection ? (
          <motion.div
            custom={isAddCollection}
            transition={transition}
            key="form"
            variants={variants}
            style={{ position: 'absolute', inset: 0 }}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <NewCollectionForm
              onBack={() => {
                setIsAddCollection(false)
              }}
              onAddCollection={() => setIsAddCollection(false)}
              parentCollection={chosenCollection}
            />
          </motion.div>
        ) : (
          <motion.div
            custom={isAddCollection}
            key="collection"
            transition={transition}
            variants={variants}
            style={{ position: 'absolute', inset: 0 }}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Collection
              style={{ height: 'calc( 100% - 34px )' }}
              defaultId={chosenCollection?.id}
              useRoute={false}
              onCollectionChange={collection => setChosenCollection(collection)}
              onCollectionSelect={collection => setSelectedCollection(collection)}
              hideDetails
              hideDocuments
            />
            <Footer
              submitText="Choose"
              onBack={onBack}
              onSubmit={() => {
                if (chosenCollection || selectedCollection) {
                  onChoose?.(chosenCollection || selectedCollection)
                } else {
                  toast.error('Choose one collection first!', { duration: 2000 })
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Menu>
  )
}
export default ChooseCollectionDialog
