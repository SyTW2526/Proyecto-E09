[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / validateOwnership

# Function: validateOwnership()

> **validateOwnership**(`userId`, `resourceUserId`): `boolean`

Defined in: [src/server/utils/userHelpers.ts:157](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L157)

Valida la propiedad de un recurso (user authorization)

## Parameters

### userId

`any`

ID del usuario actual (token)

### resourceUserId

`any`

ID del usuario propietario del recurso

## Returns

`boolean`

true si el usuario es propietario, false si no
