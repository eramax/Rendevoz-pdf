import { IconWrapper, ISvgIconProps } from '@icon-park/react/es/runtime'

export default IconWrapper('move-block', true, (props: ISvgIconProps) => (
  <svg width={props.size} height={props.size} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path d="M-1-1h1790v892H-1z" />
    <path
      d="M22 43c-4.726-1.767-8.668-7.815-10.64-11.357-.852-1.53-.403-3.408.964-4.502a3.83 3.83 0 0 1 5.1.283L19 29V17.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v2a2.5 2.5 0 0 1 5 0v7.868c0 1.07-.265 2.128-.881 3.003C37.094 39.82 35.255 42.034 33 43c-3.5 1.5-6.63 1.634-11 0zM10 8h22M14 12l-4-4 4-4M28 4l4 4-4 4M6.469 13.675l37.812 31.312"
      stroke={props.colors[0]}
      strokeWidth={props.strokeWidth}
      strokeLinecap={props.strokeLinecap}
      strokeLinejoin={props.strokeLinejoin}
    />
  </svg>
))
