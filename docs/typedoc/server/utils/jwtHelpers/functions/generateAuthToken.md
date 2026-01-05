[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/jwtHelpers](../README.md) / generateAuthToken

# Function: generateAuthToken()

> **generateAuthToken**(`userId`, `username`, `expiresIn`): `string`

Defined in: [src/server/utils/jwtHelpers.ts:21](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/jwtHelpers.ts#L21)

Genera un token JWT para autenticación de usuario

## Parameters

### userId

`string`

ID del usuario

### username

`string`

Nombre de usuario

### expiresIn

`string` = `'7d'`

Tiempo de expiración (por defecto 7 días)

## Returns

`string`

Token JWT firmado

## Example

```ts
const token = generateAuthToken(user._id.toString(), user.username);
```
