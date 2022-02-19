import { useCallback, useState } from 'react';

function useForceUpdate() {
  const [, forceUpdate] = useState({});
  return useCallback(() => forceUpdate({}), []);
}

export default useForceUpdate;
