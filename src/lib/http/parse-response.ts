export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "La solicitud falló";

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Keep fallback message when body is not JSON
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}
