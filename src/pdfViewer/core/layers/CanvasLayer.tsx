import useUpdateIsomorphicLayoutEffect from '@/hooks/utils/useUpdateIsomorphicLayoutEffect'
import { PageViewport, PDFPageProxy, RenderTask } from 'pdfjs-dist'
import { FC, memo, useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'react-use'
import { resizeCanvas } from '../utils/canvas'

const MAX_CANVAS_SIZE = 4096 * 4096

interface CanvasLayerProps {
  page: PDFPageProxy
  width: number
  height: number
  viewport: PageViewport
  scale?: number
}

const CanvasLayer: FC<CanvasLayerProps> = ({ page, width, height, viewport }) => {
  const canvasRef = useRef<HTMLCanvasElement>()
  const renderTaskRef = useRef<RenderTask>()
  const renderCanvas = (canvasEle?: HTMLCanvasElement) => {
    if (canvasEle) {
      const outputScale = window.devicePixelRatio || 1
      const maxScale = Math.sqrt(MAX_CANVAS_SIZE / (height * width))
      const shouldRescale = outputScale > maxScale
      shouldRescale ? (canvasEle.style.transform = 'scale(1, 1)') : canvasEle?.style.removeProperty('transform')
      const finalScale = Math.min(maxScale, outputScale)
      const ctx = canvasEle.getContext('2d', { alpha: false })
      canvasEle.style.height = `${height}px`
      canvasEle.style.width = `${width}px`
      resizeCanvas(ctx, width * finalScale, height * finalScale)
      canvasEle.hidden = true
      const transform = shouldRescale || outputScale !== 1 ? [finalScale, 0, 0, finalScale, 0, 0] : undefined
      renderTaskRef.current = page.render({ canvasContext: ctx, transform, viewport })
      renderTaskRef.current.promise.then(() => {
        canvasEle.hidden = false
      })
    }
  }
  useIsomorphicLayoutEffect(() => {
    const task = renderTaskRef.current
    if (task) {
      task.cancel()
    }
    const canvasEle = canvasRef.current
    renderCanvas(canvasEle)
    return () => {
      // zeroing the width & height to release memory
      if (canvasEle) {
        canvasEle.width = 0
        canvasEle.height = 0
      }
    }
  }, [])

  // do we need to rerender the whole canvas each time viewport change?
  // maybe some canvas libraies can do the resize / zoom without rerendering?
  useUpdateIsomorphicLayoutEffect(() => {
    const canvasEle = canvasRef.current
    renderCanvas(canvasEle)
  }, [viewport])
  return (
    <div
      style={{
        height,
        width,
        overflow: 'hidden',
        background: 'white'
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}
export default memo(CanvasLayer)
