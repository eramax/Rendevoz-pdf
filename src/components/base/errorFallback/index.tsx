import { RippleButton } from '@/components/custom/rippleButton'
import { css } from '@emotion/css'
import Content from '../Content'
import errorImg from '@/assets/error.png'
import { ipcInstance } from '@/plugins'

const ErrorFallback = ({ error }) => {
  return (
    <Content flex column fullHeight fullWidth centered>
      <img
        draggable={false}
        className={css({
          width: 200,
          userSelect: 'none'
        })}
        src={errorImg}
      />
      <div
        className={css({
          fontSize: 30,
          color: '#8590ae',
          fontWeight: 500,
          marginBottom: 20
        })}
      >
        Oops, something went wrong!
      </div>
      <p
        className={css({
          fontSize: 16,
          color: 'rgba(0,0,0,0.6)'
        })}
      >
        Error Message: {error.message || 'Unknown error'}
      </p>
      <p
        className={css({
          fontSize: 13,
          color: 'rgba(0,0,0,0.6)',
          marginBottom: 20
        })}
      >
        This seems to be a bug, you can report to github issues!
      </p>
      <RippleButton
        className={css({
          padding: '6px 12px'
        })}
        onClick={() => ipcInstance.send('reload')}
      >
        Reload application
      </RippleButton>
    </Content>
  )
}

export default ErrorFallback
