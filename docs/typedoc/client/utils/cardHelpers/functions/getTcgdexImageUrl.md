[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/cardHelpers](../README.md) / getTcgdexImageUrl

# Function: getTcgdexImageUrl()

> **getTcgdexImageUrl**(`pokemonTcgId`, `quality`): `string`

Defined in: [src/client/utils/cardHelpers.ts:20](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/cardHelpers.ts#L20)

Generates a TCGdex image URL from a card ID

## Parameters

### pokemonTcgId

The card ID in format "setCode-number"

`string` | `null` | `undefined`

### quality

Image quality: 'low', 'high' (default: 'high')

`"low"` | `"high"`

## Returns

`string`

TCGdex image URL or empty string if invalid ID

## Example

```typescript
const url = getTcgdexImageUrl('me01-178');
// Returns: https://assets.tcgdex.net/jp/me01/178/high.png

const url2 = getTcgdexImageUrl('swsh1-1', 'low');
// Returns: https://assets.tcgdex.net/en/swsh1/1/low.png
```
