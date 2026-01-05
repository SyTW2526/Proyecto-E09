[**proyecto-e09 v1.0.0**](../../../README.md)

***

[proyecto-e09](../../../modules.md) / [services/tcgdx](../README.md) / getCardCategory

# Function: getCardCategory()

> **getCardCategory**(`card`): `"pokemon"` \| `"trainer"` \| `"energy"` \| `"unknown"`

Defined in: [src/server/services/tcgdx.ts:73](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/services/tcgdx.ts#L73)

Determina la categoría de una carta basándose en su tipo
Analiza el campo supertype para clasificar la carta

## Parameters

### card

`Record`\<`string`, `any`\>

Objeto de carta de la API

## Returns

`"pokemon"` \| `"trainer"` \| `"energy"` \| `"unknown"`

Categoría de la carta

## Example

```ts
const category = getCardCategory(cardData);
// Returns: 'pokemon' | 'trainer' | 'energy' | 'unknown'
```
