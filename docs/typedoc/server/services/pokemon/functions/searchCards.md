[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/services/pokemon](../README.md) / searchCards

# Function: searchCards()

> **searchCards**(`filters`): `Promise`\<`any`\>

Defined in: [src/server/services/pokemon.ts:143](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/pokemon.ts#L143)

Búsqueda avanzada de cartas con múltiples filtros

## Parameters

### filters

Objeto con filtros opcionales (name, types, hp, rarity, etc.)

#### hp?

`number`

#### name?

`string`

#### rarity?

`string`

#### set?

`string`

#### types?

`string`

## Returns

`Promise`\<`any`\>

Array de cartas que cumplen los filtros
