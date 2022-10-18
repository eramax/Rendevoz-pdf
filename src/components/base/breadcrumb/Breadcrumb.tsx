import { Children, cloneElement, FC } from 'react'
import BreadcrumbItem from './BreadcrumbItem'
import classNames from 'classnames'
import styles from './index.module.less'
import { toArray } from 'lodash'

export interface BreadcrumbProps {
  separator?: React.ReactNode
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

interface IBreadcrumb extends FC<BreadcrumbProps> {
  Item: typeof BreadcrumbItem
}

const Breadcrumb: IBreadcrumb = ({ separator = '/', style, className, children }) => {
  const clazzName = classNames(styles.breadcrumb, className)
  let crumbs
  if (children) {
    crumbs = Children.toArray(children).map((item, index) => {
      if (!item) {
        return item
      }
      return cloneElement(item, {
        separator: item.props?.separator ?? separator,
        key: index
      })
    })
  }
  return (
    <nav style={style} className={clazzName}>
      <ol>{crumbs}</ol>
    </nav>
  )
}

Breadcrumb.Item = BreadcrumbItem

export default Breadcrumb
