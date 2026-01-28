/**
 * Checks if a web fragment is available by making a health check request.
 * This triggers gateway forwarding (this is NOT a browser navigation).
 *
 * @param fragmentSrc - The source URL of the fragment (e.g., "/showcase/")
 * @param fragmentId - The ID of the fragment (e.g., "showcase-lab")
 * @returns Promise that resolves to true if the fragment is available, false otherwise
 */
export async function checkFragmentHealth(
  fragmentSrc: string,
  fragmentId: string,
): Promise<boolean> {
  try {
    const response = await fetch(fragmentSrc, {
      headers: {
        accept: "text/html",
        "x-web-fragment-id": fragmentId,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
