[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [services/tcgdx](../README.md) / normalizeImageUrl

# Function: normalizeImageUrl()

> **normalizeImageUrl**(`url?`): `string`

Defined in: [src/server/services/tcgdx.ts:107](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/tcgdx.ts#L107)

Normaliza una URL de imagen para apuntar a la versión de alta resolución.

Maneja casos especiales:
- Corrige URLs de TCGdex que faltan la serie: /jp/swsh1/ → /en/swsh/swsh1/
- Cambia idioma de jp a en (solo queremos cartas en inglés)
- Reemplaza /small.png, /large.png, /low.png por /high.png
- Detecta URLs ya correctas para evitar duplicar la serie

## Parameters

### url?

URL de imagen a normalizar

`string` | `null`

## Returns

`string`

URL normalizada apuntando a versión high.png

## Examples

```ts
normalizeImageUrl('https://assets.tcgdex.net/jp/swsh1/25/low.png')
// => 'https://assets.tcgdex.net/en/swsh/swsh1/25/high.png'
```

```ts
normalizeImageUrl('https://assets.tcgdex.net/en/me/me01/186/high.png')
// => 'https://assets.tcgdex.net/en/me/me01/186/high.png' (sin cambios, ya correcta)
```
