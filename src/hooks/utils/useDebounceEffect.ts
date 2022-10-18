import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import useDebounceFn from './useDebounceFn';
import useUpdateEffect from './useUpdateEffect';

function useDebounceEffect(
  effect: EffectCallback,
  deps?: DependencyList,
  options?:  { wait?: number; leading?: boolean; trailing?: boolean; maxWait?: number },
) {
  const [flag, setFlag] = useState({});

  const { run } = useDebounceFn(() => {
    setFlag({});
  }, options);

  useEffect(() => {
    return run();
  }, deps);

  useUpdateEffect(effect, [flag]);
}
export default useDebounceEffect;