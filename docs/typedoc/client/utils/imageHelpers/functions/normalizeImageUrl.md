[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/imageHelpers](../README.md) / normalizeImageUrl

# Function: normalizeImageUrl()

> **normalizeImageUrl**(`url?`): `string`

Defined in: [src/client/utils/imageHelpers.ts:23](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/imageHelpers.ts#L23)

Normaliza y corrige URLs de imágenes de cartas TCGdex

Corrige URLs malformadas que vienen de la API de TCGdex:
- Inserta el componente de serie faltante (swsh, sm, xy, etc.)
- Fuerza idioma inglés (en)
- Convierte calidad a high

## Parameters

### url?

`string`

URL de imagen a normalizar

## Returns

`string`

URL normalizada o string vacío si no hay URL

## Example

```ts
// URL malformada
normalizeImageUrl('https://assets.tcgdex.net/jp/swsh5/123/low.png')
// Retorna: 'https://assets.tcgdex.net/en/swsh/swsh5/123/high.png'
```
