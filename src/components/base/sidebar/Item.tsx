import * as React from 'react'
import { motion } from 'framer-motion'
import styles from './index.module.less'
import { NavLink } from 'react-router-dom'
import NavLinkWithChildren from '../navLink'

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
}

export const MenuItem = ({ children, to }) => {
  return (
    <NavLinkWithChildren to={to}>
      {match => (
        <motion.li className={`${styles.item} ${match && styles.match}`} variants={variants}>
          {children}
        </motion.li>
      )}
    </NavLinkWithChildren>
  )
}
