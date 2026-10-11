import type { StyleSpecification } from 'maplibre-gl';

let stylePromise: Promise<StyleSpecification> | undefined;

export function loadUrbanMapStyle(): Promise<StyleSpecification> {
  if (!stylePromise) {
    stylePromise = fetch(new URL('maps/urban-style.json', document.baseURI), {
      signal: AbortSignal.timeout(6000),
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Estilo cartográfico indisponível (HTTP ${response.status}).`);
        const style = (await response.json()) as StyleSpecification;
        return { ...style, sprite: new URL('maps/occurrence-pins', document.baseURI).href };
      })
      .catch((error: unknown) => {
        stylePromise = undefined;
        throw error;
      });
  }
  return stylePromise;
}
