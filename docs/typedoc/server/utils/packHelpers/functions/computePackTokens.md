[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/packHelpers](../README.md) / computePackTokens

# Function: computePackTokens()

> **computePackTokens**(`user`): `object`

Defined in: [src/server/utils/packHelpers.ts:26](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/packHelpers.ts#L26)

Calcula los tokens disponibles y el siguiente tiempo permitido
Implementa token-bucket rate limiting: max 2 opens per 24h, refill cada 12h

## Parameters

### user

`any`

Usuario con packTokens y packLastRefill

## Returns

`object`

### nextAllowed

> **nextAllowed**: `Date` \| `null`

### now

> **now**: `number`

### tokens

> **tokens**: `any` = `currentTokens`
