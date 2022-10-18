import React from 'react'
import styles from './index.module.less'

interface Props {
  children: any
  onClick?: () => void
  className?: string
  tabIndex?: number
}
export const RippleButton: React.FC<Props> = (props) => {
  const { children, onClick, className, tabIndex } = props
  const [coords, setCoords] = React.useState({ x: -1, y: -1 })
  const [isRippling, setIsRippling] = React.useState(false)

  React.useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1 && !isRippling) {
      setIsRippling(true)
      setTimeout(() => setIsRippling(false), 600)
    } else setIsRippling(false)
  }, [coords])

  React.useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 })
  }, [isRippling])

  return (
    <button
      type="button"
      tabIndex={tabIndex}
      className={`${styles.RippleButton} ${className}`}
      onClick={e => {
        const rect = e.target.getBoundingClientRect()
        setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        onClick?.()
      }}
    >
      {isRippling ? (
        <span
          className={styles.ripple}
          style={{
            left: coords.x,
            top: coords.y
          }}
        />
      ) : (
        ''
      )}
      <span className={styles.content}>{children}</span>
    </button>
  )
}
