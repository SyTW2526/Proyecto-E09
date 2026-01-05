[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/validationHelpers](../README.md) / validateUsernameEmail

# Function: validateUsernameEmail()

> **validateUsernameEmail**(`newUsername?`, `newEmail?`, `currentUsername?`, `currentEmail?`): `Promise`\<\{ `error?`: `string`; `field?`: `string`; `valid`: `boolean`; \}\>

Defined in: [src/server/utils/validationHelpers.ts:32](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/validationHelpers.ts#L32)

Valida que un username y email no estén en uso

## Parameters

### newUsername?

`string`

Username a validar (puede ser undefined si no se cambia)

### newEmail?

`string`

Email a validar (puede ser undefined si no se cambia)

### currentUsername?

`string`

Username actual del usuario (para comparación)

### currentEmail?

`string`

Email actual del usuario (para comparación)

## Returns

`Promise`\<\{ `error?`: `string`; `field?`: `string`; `valid`: `boolean`; \}\>
