
import React, { createContext, useContext } from 'react';

/**
 * Advanced Features context.
 * enabled: boolean
 * setEnabled: fn(boolean)
 */
export const AdvancedContext = createContext({ enabled: false, setEnabled: () => {} });

export function useAdvanced() {
  return useContext(AdvancedContext);
}
