import Icon from '@/components/base/Icon'
import Menu from '@/components/base/menu'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { CSSProperties, FC, ReactElement, useEffect, useState } from 'react'
import AnimatePopover from '../AnimatePopover'
import Content from '../Content'
import SelectOption, { SelectOptionProps } from './SelectOption'
import styles from './index.module.less'
import WithBorder from '../WithBorder'
import classNames from 'classnames'
import { isArray } from 'lodash'
import { useUpdateEffect } from '@/hooks'

interface SelectProps {
  multiple?: boolean
  value?: string | string[]
  closeOnSelect?: boolean
  disabled?: boolean
  defaultValue?: string
  children: ReactElement<SelectOptionProps> | ReactElement<SelectOptionProps>[]
  placeholder?: string
  className?: string
  onSelect: (value: string[]) => void
  style?: CSSProperties
}
interface ISelect extends FC<SelectProps> {
  Option: typeof SelectOption
}
const Select: ISelect = ({ disabled, multiple, children, closeOnSelect, onSelect, placeholder, style, className, value, defaultValue }) => {
  let d = []
  if (defaultValue) {
    d = [defaultValue]
  }
  const [selected, setSelected] = useState<string[]>(d)
  let v = null
  if (value) {
    if (isArray(value)) {
      v = value
    } else {
      v = [value]
    }
  }
  const [menuVisible, setMenuVisible] = useState(false)
  let options = children
  if (!Array.isArray(children)) {
    options = [children]
  }
  const menuItems = options.map(o => ({
    name: o.props.children,
    value: o.props.value
  }))

  useEffect(() => {
    if (v) {
      setSelected(v)
    }
  }, [value])
  const renderMultiple = () => {
    return (
      <LayoutGroup>
        <AnimatePresence>
          {selected.map(i => (
            <motion.div
              layout
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <Tag
                key={i}
                tag={i}
                onDelete={() => {
                  setSelected(() => {
                    const newSelected = selected.filter(o => o !== i)
                    onSelect(newSelected.map(i => menuItems.find(o => o.name === i).value))
                    return newSelected
                  })
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>
    )
  }
  const renderSingle = () => {
    return (
      <Content flex>
        <span className={styles.placeholder}>
          {placeholder ? (
            <div>
              {placeholder} : {selected[0]}
            </div>
          ) : (
            selected[0]
          )}
        </span>
      </Content>
    )
  }
  return (
    <AnimatePopover
      visible={menuVisible}
      positions={['bottom']}
      onClickOutside={() => setMenuVisible(false)}
      padding={10}
      containerStyle={{ zIndex: '10000' }}
      content={
        <WithBorder style={{ padding: '8px 0px' }} borderRadius={5}>
          <SelectMenu
            menuItems={menuItems}
            selectedItems={selected}
            onDeSelect={name => {
              setSelected(() => {
                const newSelected = selected.filter(o => o !== name)
                onSelect(newSelected.map(i => menuItems.find(o => o.name === i).value))
                return newSelected
              })
              if (closeOnSelect) {
                setMenuVisible(false)
              }
            }}
            onSelect={name => {
              if (multiple) {
                setSelected(() => {
                  const newSelected = [...selected, name]
                  onSelect(newSelected.map(i => menuItems.find(o => o.name === i).value))
                  return newSelected
                })
              } else {
                setSelected(() => {
                  const newSelected = [name]
                  onSelect(newSelected.map(i => menuItems.find(o => o.name === i).value))
                  return newSelected
                })
              }
              if (closeOnSelect) {
                setMenuVisible(false)
              }
            }}
          />
        </WithBorder>
      }
    >
      <Content
        onMouseDown={e => e.preventDefault()}
        style={style}
        className={classNames(
          styles.selectContainer,
          menuVisible ? styles.focused : undefined,
          disabled ? styles.disabled : undefined,
          className
        )}
        onClick={() => !disabled && setMenuVisible(!menuVisible)}
        flex
      >
        {disabled ? null : selected.length ? (
          <Content fullWidth flex justifyContent="space-between">
            {multiple ? renderMultiple() : renderSingle()}
            <Icon name="park-down" />
          </Content>
        ) : (
          <Content fullWidth flex justifyContent="space-between">
            <span className={styles.placeholder}>{placeholder}</span>
            <Icon name="park-down" />
          </Content>
        )}
      </Content>
    </AnimatePopover>
  )
}
const SelectMenu: FC<{
  menuItems: {
    name: string
    value: string
  }[]
  onSelect: (name: string, value: string) => void
  onDeSelect: (name: string, value: string) => void
  selectedItems: string[]
}> = ({ menuItems, onDeSelect, onSelect, selectedItems }) => {
  return (
    <Menu>
      {menuItems.map(item => (
        <Menu.Item
          onClick={() => {
            if (selectedItems.some(i => i === item.name)) {
              onDeSelect(item.name, item.value)
            } else {
              onSelect(item.name, item.value)
            }
          }}
          selected={selectedItems.some(i => i === item.name)}
          type="button"
        >
          {item.name}
        </Menu.Item>
      ))}
    </Menu>
  )
}
const Tag: FC<{
  tag: string
  onDelete: () => void
}> = ({ tag, onDelete }) => {
  return (
    <Content centered className={styles.tag} onClick={e => e.stopPropagation()} flex>
      <span>{tag}</span>
      <Icon size={12} onClick={onDelete} name="park-close" />
    </Content>
  )
}
Select.Option = SelectOption

export default Select
