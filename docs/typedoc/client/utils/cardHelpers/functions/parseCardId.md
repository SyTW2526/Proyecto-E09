[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [client/utils/cardHelpers](../README.md) / parseCardId

# Function: parseCardId()

> **parseCardId**(`pokemonTcgId`): \{ `number`: `string`; `setCode`: `string`; \} \| `null`

Defined in: [src/client/utils/cardHelpers.ts:86](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/client/utils/cardHelpers.ts#L86)

Extracts set code and number from a Pokémon TCG ID

## Parameters

### pokemonTcgId

The card ID in format "setCode-number"

`string` | `null` | `undefined`

## Returns

\{ `number`: `string`; `setCode`: `string`; \} \| `null`

Object with setCode and number, or null if invalid

## Example

```typescript
const parts = parseCardId('me01-178');
// Returns: { setCode: 'me01', number: '178' }

const invalid = parseCardId('invalid');
// Returns: null
```
