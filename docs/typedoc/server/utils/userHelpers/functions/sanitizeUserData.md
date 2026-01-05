[**proyecto-e09 v1.0.0**](../../../../README.md)

***

[proyecto-e09](../../../../modules.md) / [server/utils/userHelpers](../README.md) / sanitizeUserData

# Function: sanitizeUserData()

> **sanitizeUserData**(`user`): `object`

Defined in: [src/server/utils/userHelpers.ts:70](https://github.com/SyTW2526/Proyecto-E09/blob/main/src/server/utils/userHelpers.ts#L70)

Sanitiza los datos de usuario para respuestas públicas
Elimina campos sensibles como password

## Parameters

### user

`any`

## Returns

`object`

### createdAt

> **createdAt**: `any` = `sanitized.createdAt`

### email

> **email**: `any` = `sanitized.email`

### id

> **id**: `any` = `sanitized._id`

### profileImage

> **profileImage**: `any`

### username

> **username**: `any` = `sanitized.username`
