[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [services/tcgdx](../README.md) / extractPrices

# Function: extractPrices()

> **extractPrices**(`card`): `object`

Defined in: [src/server/services/tcgdx.ts:169](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/tcgdx.ts#L169)

Extract price information from a TCGdex brief card object.
Tries multiple common shapes and returns cardmarketAvg, tcgplayerMarketPrice and a chosen avg.

## Parameters

### card

`Record`\<`string`, `any`\>

## Returns

`object`

### avg

> **avg**: `number` \| `null`

### cardmarketAvg

> **cardmarketAvg**: `number` \| `null`

### tcgplayerMarketPrice

> **tcgplayerMarketPrice**: `number` \| `null`
