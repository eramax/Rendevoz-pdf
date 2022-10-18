import getEmoji from '@/utils/emoji'
import { FC, useEffect, useState } from 'react'
import { RenderElementProps, useFocused, useSelected } from 'slate-react'

const Emoji: FC<RenderElementProps> = ({ element, children, attributes }) => {
  const [emoji, setEmoji] = useState()
  useEffect(() => {
    getEmoji(element.name).then(data => setEmoji(data))
  }, [])
  const InlineChromiumBugfix = () => (
    <span contentEditable={false} style={{ fontSize: 0 }}>
      ${String.fromCodePoint(160) /* Non-breaking space */}
    </span>
  )
  return (
    <span {...attributes} style={{ margin: '0 0.1em', fontSize: element?.fontSize ? element.fontSize : '16px' }}>
      <InlineChromiumBugfix />
      <img
        src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
        style={{
          width: '1em',
          height: '1em',
          backgroundImage: `url(${emoji?.imageSrc})`,
          backgroundPositionX: `${(emoji?.x * 100) / 60}%`,
          backgroundPositionY: `${(emoji?.y * 100) / 60}%`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '6100% 6100%',
          verticalAlign: '-0.1em'
        }}
      />
      {children}
      <InlineChromiumBugfix />
    </span>
  )
}

export default Emoji
