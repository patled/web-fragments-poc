import { useEffect, useRef, useState } from "react";
import { checkFragmentHealth } from "../utils/fragmentHealthCheck";

/**
 * Custom hook to check if a web fragment is available.
 * Runs the health check immediately on mount.
 *
 * @param fragmentSrc - The source URL of the fragment (e.g., "/showcase/")
 * @param fragmentId - The ID of the fragment (e.g., "showcase-lab")
 * @param options - Optional configuration
 * @param options.onError - Optional callback when fragment is unavailable
 * @returns The availability status: null (checking), true (available), or false (unavailable)
 */
export function useFragmentHealthCheck(
  fragmentSrc: string,
  fragmentId: string,
  options?: {
    onError?: (error: unknown) => void;
  },
): boolean | null {
  const [fragmentAvailable, setFragmentAvailable] = useState<boolean | null>(
    null,
  );
  const onErrorRef = useRef(options?.onError);

  // Keep the latest callback in a ref to avoid re-running the effect
  useEffect(() => {
    onErrorRef.current = options?.onError;
  }, [options?.onError]);

  useEffect(() => {
    let cancelled = false;

    const healthCheck = async () => {
      try {
        const isAvailable = await checkFragmentHealth(fragmentSrc, fragmentId);

        if (cancelled) return;
        setFragmentAvailable(isAvailable);

        if (!isAvailable && onErrorRef.current) {
          onErrorRef.current(new Error(`Fragment ${fragmentId} not available`));
        }
      } catch (error) {
        if (cancelled) return;
        setFragmentAvailable(false);
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    };

    // Run immediately (and rely on fragment events afterwards)
    healthCheck();

    return () => {
      cancelled = true;
    };
  }, [fragmentSrc, fragmentId]);

  return fragmentAvailable;
}
