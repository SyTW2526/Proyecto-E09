[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/cardHelpers](../README.md) / getCardImage

# Function: getCardImage()

> **getCardImage**(`images?`, `pokemonTcgId?`, `imageUrl?`): `string`

Defined in: [src/client/utils/cardHelpers.ts:56](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/cardHelpers.ts#L56)

Gets the best available image URL for a card, with TCGdex fallback

## Parameters

### images?

Card images object with large/small properties

\{ `large?`: `string`; `small?`: `string`; \} | `null`

### pokemonTcgId?

Card ID for fallback generation

`string` | `null`

### imageUrl?

Alternative image URL

`string` | `null`

## Returns

`string`

Best available image URL

## Example

```typescript
const url = getCardImage(
  { large: 'https://...', small: 'https://...' },
  'me01-178',
  'https://fallback.com/image.png'
);
```
