import { useIsomorphicLayoutEffect } from 'react-use'
import { createUpdateEffect } from './useUpdateEffect'

export default createUpdateEffect(useIsomorphicLayoutEffect)
