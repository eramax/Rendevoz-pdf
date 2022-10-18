export function resizeCanvas(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = ctx.canvas.width
  tempCanvas.height = ctx.canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx?.drawImage(ctx.canvas, 0, 0)
  ctx.canvas.width = width
  ctx.canvas.height = height
  ctx.drawImage(tempCanvas, 0, 0)
}
