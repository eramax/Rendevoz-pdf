import { ReadMore, Content } from '@/components'
import { FC, useEffect, useState } from 'react'
import { RenderElementProps, useFocused, useSelected } from 'slate-react'
import { HighlighElement } from '../../types/outerElementTypes'
import styles from './index.module.less'
import { AnimatePresence, motion } from 'framer-motion'
const Highlight: FC<RenderElementProps> = ({ element, children, attributes }) => {
  const highlightElement = element as HighlighElement
  const [showToolbar, setShowToolbar] = useState(false)
  const selected = useSelected()
  useEffect(() => {
    if (!selected) {
      setShowToolbar(false)
    }
  }, [selected])
  return (
    <div contentEditable={false} {...attributes}>
      <Content
        onClick={() => {
          // setShowToolbar(true)
        }}
        className={styles.selectedTextContainer}
      >
        <ReadMore>{highlightElement.selectedText}</ReadMore>
        <AnimatePresence>
          {showToolbar ? (
            <motion.div
              key="1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
            </motion.div>
          ) : undefined}
        </AnimatePresence>
      </Content>
      {children}
    </div>
  )
}
export default Highlight
