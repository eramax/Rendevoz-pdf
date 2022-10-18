import { PageViewport } from 'pdfjs-dist'
import { Point } from '../types'
import pdfJs from '../types/pdfJsApi'
import { TextContentBound, TextContentOffset, TextContentTrans } from '../types/text'

export const getCoordAfterTrans = (point: Point, trans: TextContentTrans) => {
  if (!trans) return point
  const { x, y } = point
  return {
    x: x * trans[0] + y * trans[1],
    y: x * trans[2] + y * trans[3]
  }
}
export const getCharPoint = (viewport, transform) => {
  const trans = pdfJs.Util.transform(viewport.transform, transform)
  return {
    x: trans[4],
    y: trans[5]
  }
}
export const getPointsOfRect = (offset: TextContentOffset) => {
  const trans = offset.trans
  if (!trans)
    return [
      {
        x: offset.left,
        y: offset.top
      },
      {
        x: offset.right,
        y: offset.top
      },
      {
        x: offset.right,
        y: offset.bottom
      },
      {
        x: offset.left,
        y: offset.bottom
      }
    ]
  const [width, height] = offset.size,
    leftTop = {
      x: trans[4],
      y: trans[5]
    },
    rightTop = {
      x: leftTop.x + width * trans[0],
      y: leftTop.y + width * trans[1]
    },
    rightBottom = {
      x: leftTop.x - height * trans[1],
      y: leftTop.y + height * trans[0]
    },
    leftBottom = {
      x: rightTop.x + rightBottom.x - leftTop.x,
      y: rightTop.y + rightBottom.y - leftTop.y
    }
  return [leftTop, rightTop, leftBottom, rightBottom]
}
export const getOffsetAfterTrans = (offset: TextContentOffset) => {
  const trans = offset.trans
  if (!trans) return offset
  const [leftTop, , rightBottom] = getPointsOfRect(offset),
    leftTopAfterTrans = getCoordAfterTrans(leftTop, trans),
    rightBottomAfterTrans = getCoordAfterTrans(rightBottom, trans)
  return {
    ...offset,
    left: leftTopAfterTrans.x,
    right: rightBottomAfterTrans.x,
    top: leftTopAfterTrans.y,
    bottom: rightBottomAfterTrans.y
  }
}
export const isInRect = (offset: TextContentOffset, point: Point, distanceTolerance: number) => {
  const coord = getCoordAfterTrans(point, offset.trans)
  const x = coord.x,
    y = coord.y,
    offsetAfterTrans = getOffsetAfterTrans(offset),
    { left, right, top, bottom } = offsetAfterTrans
  return x >= left - distanceTolerance && x <= right + distanceTolerance && y >= top - distanceTolerance && y <= bottom + distanceTolerance
}
export const isInBounds = (bounds: TextContentBound[], point: Point, distanceTolerance: number) => {
  for (let i = 0; i < bounds.length; i += 1) {
    const bound = bounds[i]
    if (isInRect(bound.offset, point, distanceTolerance)) return true
  }
  return false
}
export const getNearestDistanceBetweenPointAndRect = (offset: TextContentOffset, point: Point) => {
  let distance
  if (isInRect(offset, point, 0)) distance = 0
  else {
    const distances = getPointsOfRect(offset).map(rectPoint => Math.pow(point.x - rectPoint.x, 2) + Math.pow(point.y - rectPoint.y, 2))
    distance = Math.min(...distances)
  }
  return distance
}
export const getTargetTextBound = (
  bound: TextContentBound,
  point: Point,
  include: boolean,
  viewport: PageViewport,
  ctx: CanvasRenderingContext2D
) => {
  const pointCoord = getCoordAfterTrans(point, bound.offset.trans),
    boundCoord = bound.offset.trans
      ? getCoordAfterTrans(
          {
            x: bound.offset.trans[4],
            y: bound.offset.trans[5]
          },
          bound.offset.trans
        )
      : {
          x: bound.offset.left,
          y: bound.offset.top
        },
    relX = pointCoord.x - boundCoord.x
  const chars = bound.textItem.chars || []
  // not in bound
  if (relX <= 0)
    return {
      text: '',
      width: 0
    }
  const resultChars = []
  let rx = 0
  for (let i = 0; i < chars.length; i += 1) {
    if (!chars[i].transform) {
      resultChars.push(chars[i])
      continue
    }
    const transformedCharPoint = getCharPoint(viewport, chars[i].transform),
      charRelX = getCoordAfterTrans(transformedCharPoint, bound.offset.trans).x - boundCoord.x
    if (include) {
      if (charRelX >= relX) break
      resultChars.push(chars[i]), (rx = charRelX)
    } else if ((resultChars.push(chars[i]), (rx = charRelX), charRelX >= relX)) break
  }
  const lastChar = resultChars[resultChars.length - 1]
  if (lastChar)
    return {
      text: lastChar.str,
      width: rx
    }
  ctx.font = `${bound.style.fontSize} ${bound.style.fontFamily}`
  const fontWidth = bound.offset.size[0] / ctx.measureText(bound.str).width
  let resultStr = ''
  const str = bound.str
  const resultStrWidth = 0
  for (let i = 0; i < str.length; i += 1) {
    resultStr += str[i]
    const resultStrWidth = ctx.measureText(resultStr).width * fontWidth
    if (resultStrWidth >= relX) {
      break
    }
  }
  return (
    include && resultStrWidth > relX && (resultStr = resultStr.substring(0, resultStr.length - 1)),
    {
      text: resultStr,
      width: ctx.measureText(resultStr).width * fontWidth
    }
  )
}
export const getStartTextRect = (bound: TextContentBound, ctx: CanvasRenderingContext2D, point: Point, viewport: PageViewport) => {
  const offset = bound.offset,
    str = bound.str,
    trans = offset.trans,
    textBound = getTargetTextBound(bound, point, true, viewport, ctx)
  let targetStr = str.substring(textBound.text.length)
  bound.textItem.hasEOL && (targetStr += ` `)
  return trans
    ? {
        x: trans[4],
        y: trans[5],
        width: bound.offset.size[0] - textBound.width,
        height: bound.offset.size[1],
        offset: {
          angle: bound.offset.angle,
          dx: textBound.width,
          dy: 0
        },
        text: targetStr
      }
    : {
        x: offset.left + textBound.width,
        y: offset.top,
        width: bound.offset.size[0] - textBound.width,
        height: bound.offset.size[1],
        text: targetStr
      }
}
export const getEndTextRect = (bound: TextContentBound, ctx: CanvasRenderingContext2D, point: Point, viewport: PageViewport) => {
  const offset = bound.offset
  const trans = offset.trans
  const textBound = getTargetTextBound(bound, point, false, viewport, ctx),
    targetText = textBound.text
  return trans
    ? {
        x: trans[4],
        y: trans[5],
        width: textBound.width,
        height: bound.offset.size[1],
        offset: {
          angle: bound.offset.angle,
          dx: 0,
          dy: 0
        },
        text: targetText
      }
    : {
        x: offset.left,
        y: offset.top,
        width: textBound.width,
        height: bound.offset.size[1],
        text: targetText
      }
}
export const getTextRect = (bound: TextContentBound, ctx: CanvasRenderingContext2D, points: Point[], viewport: PageViewport) => {
  const offset = bound.offset,
    str = bound.str,
    trans = offset.trans,
    [startPoint, endPoint] = points
  if (startPoint && !endPoint) return getStartTextRect(bound, ctx, startPoint, viewport)
  if (!startPoint && endPoint) return getEndTextRect(bound, ctx, endPoint, viewport)
  if (startPoint && endPoint) {
    const startPointCoord = getCoordAfterTrans(startPoint, offset.trans),
      endPointCoord = getCoordAfterTrans(endPoint, offset.trans),
      [realStart, realEnd] = startPointCoord.x >= endPointCoord.x ? [endPoint, startPoint] : [startPoint, endPoint],
      startTextBound = getTargetTextBound(bound, realStart, false, viewport, ctx),
      endTextBound = getTargetTextBound(bound, realEnd, undefined, viewport, ctx),
      targetText = str.substring(startTextBound.text.length, endTextBound.text.length)
    return trans
      ? {
          x: trans[4],
          y: trans[5],
          width: endTextBound.width - startTextBound.width,
          height: offset.size[1],
          offset: {
            angle: offset.angle,
            dx: startTextBound.width,
            dy: 0
          },
          text: targetText
        }
      : {
          x: offset.left + startTextBound.width,
          y: offset.top,
          width: endTextBound.width - startTextBound.width,
          height: offset.size[1],
          text: targetText
        }
  }
  let s = str
  bound.textItem.hasEOL && (s += ``)
  return trans
    ? {
        x: trans[4],
        y: trans[5],
        width: offset.size[0],
        height: offset.size[1],
        offset: {
          angle: offset.angle,
          dx: 0,
          dy: 0
        },
        text: s
      }
    : {
        x: offset.left,
        y: offset.top,
        width: offset.size[0],
        height: offset.size[1],
        text: s
      }
}
export const getWordRect = (bound: TextContentBound, point: Point, viewport: PageViewport) => {
  const pointPos = getCoordAfterTrans(point, bound.offset.trans)
  const boundPos = bound.offset.trans
    ? getCoordAfterTrans(
        {
          x: bound.offset.trans[4],
          y: bound.offset.trans[5]
        },
        bound.offset.trans
      )
    : {
        x: bound.offset.left,
        y: bound.offset.top
      }
  const relX = pointPos.x - boundPos.x
  const chars = bound.textItem.chars
  const result = []
  let targetCharIdx = 0
  for (; targetCharIdx < chars.length; targetCharIdx += 1) {
    if (!chars[targetCharIdx].transform) {
      continue
    }
    const charPoint = getCharPoint(viewport, chars[targetCharIdx].transform)
    if (getCoordAfterTrans(charPoint, bound.offset.trans).x - boundPos.x >= relX) break
  }
  let tempIdx = targetCharIdx
  // get first char
  while (tempIdx >= 0) {
    const targetChar = chars[tempIdx]
    const prevChar = chars[tempIdx - 1]
    if (prevChar && targetChar) {
      const char = targetChar.str.substring(prevChar.str.length)
      if (/\s/.test(char) || /\x00/.test(char)) {
        result.push({
          idx: tempIdx,
          char: prevChar
        })
        break
      } else {
        tempIdx -= 1
      }
    } else {
      result.push(null)
      break
    }
  }
  // get end char
  for (tempIdx = targetCharIdx; tempIdx <= chars.length - 1; ) {
    const targetChar = chars[tempIdx]
    const nextChar = chars[tempIdx + 1]
    if (nextChar) {
      const char = nextChar.str.substring(targetChar.str.length)
      if (/\s/.test(char) || /\x00/.test(char)) {
        result.push({
          idx: tempIdx,
          char: targetChar
        })
        break
      } else {
        tempIdx += 1
      }
    } else {
      result.push({
        idx: tempIdx,
        char: targetChar
      })
      break
    }
  }
  // no end
  if (!result[1]) return null
  let firstCharPos = null
  result[0]
    ? (firstCharPos = getCoordAfterTrans(getCharPoint(viewport, result[0].char.transform), bound.offset.trans))
    : (firstCharPos = boundPos)
  const endCharPos = getCoordAfterTrans(getCharPoint(viewport, result[1].char.transform), bound.offset.trans)
  const trans = bound.offset.trans
  const charRelX = endCharPos.x - firstCharPos.x
  const text = result[1].char.str.substring((result[0] === null ? undefined : result[0].char.str.length) || 0)
  return trans
    ? {
        x: trans[4],
        y: trans[5],
        width: charRelX,
        height: bound.offset.size[1],
        offset: {
          angle: bound.offset.angle,
          dx: firstCharPos.x - boundPos.x,
          dy: 0
        },
        text
      }
    : {
        x: firstCharPos.x,
        y: bound.offset.top,
        width: charRelX,
        height: bound.offset.size[1],
        text
      }
}
