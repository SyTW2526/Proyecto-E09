[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/services/cardDataBuilder](../README.md) / buildGenericCardData

# Function: buildGenericCardData()

> **buildGenericCardData**(`raw`): `object`

Defined in: [src/server/services/cardDataBuilder.ts:133](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/cardDataBuilder.ts#L133)

Construye datos para cartas genéricas (fallback)

## Parameters

### raw

`any`

## Returns

`object`

### cardNumber

> **cardNumber**: `string` = `base.cardNumber`

### category

> **category**: `"unknown"`

### illustrator

> **illustrator**: `string` = `base.illustrator`

### imageUrl

> **imageUrl**: `string` = `base.images.small`

### imageUrlHiRes

> **imageUrlHiRes**: `string` = `base.images.large`

### lastPriceUpdate

> **lastPriceUpdate**: `Date` = `base.lastPriceUpdate`

### name

> **name**: `string` = `base.name`

### nationalPokedexNumber

> **nationalPokedexNumber**: `any`

### pokemonTcgId

> **pokemonTcgId**: `string` = `base.pokemonTcgId`

### price

> **price**: `NormalizedPrices` = `base.price`

### rarity

> **rarity**: `string` = `base.rarity`

### series

> **series**: `string` = `base.series`

### set

> **set**: `string` = `base.set`

### types

> **types**: `any`
