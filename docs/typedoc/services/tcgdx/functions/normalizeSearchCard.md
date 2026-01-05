[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [services/tcgdx](../README.md) / normalizeSearchCard

# Function: normalizeSearchCard()

> **normalizeSearchCard**(`card`): `object`

Defined in: [src/server/services/tcgdx.ts:238](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/tcgdx.ts#L238)

Normaliza una carta RAW de la API TCGdex para búsquedas y respuestas frontend
Crea una forma mínima y consistente que el frontend espera

## Parameters

### card

`any`

Objeto de carta RAW de la API

## Returns

`object`

Objeto normalizado con campos: id, name, images, set, rarity, types, pokemonTcgId

### id

> **id**: `any`

### images

> **images**: `any`

### name

> **name**: `any`

### pokemonTcgId

> **pokemonTcgId**: `any`

### rarity

> **rarity**: `any`

### set

> **set**: `any`

### setId

> **setId**: `any`

### types

> **types**: `any`

## Example

```ts
const normalized = normalizeSearchCard(rawCard);
// Returns: { id: 'swsh3-25', name: 'Pikachu', images: {...}, set: 'Sword & Shield', ... }
```
